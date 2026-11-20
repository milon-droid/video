#!/usr/bin/env node
// free-audio — search and download CC-licensed sound effects and music from
// Openverse (aggregates Freesound, Jamendo and Wikimedia Commons). No API key.

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createWriteStream } from 'node:fs'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import path from 'node:path'
import os from 'node:os'

const OPENVERSE_AUDIO = 'https://api.openverse.org/v1/audio/'
const REQUEST_HEADERS = {
    'User-Agent': 'free-audio-skill/1.0 (+https://github.com/MichaelBarney/agent-skills)',
    'Accept': 'application/json',
}
const CACHE_DIRECTORY = path.join(os.homedir(), '.cache', 'free-audio')
const LAST_SEARCH_FILE = path.join(CACHE_DIRECTORY, 'last-search.json')
const MANIFEST_FILENAME = '.free-audio-manifest.json'
const CREDITS_FILENAME = 'CREDITS.md'

// Openverse exposes `category` only for a minority of records — every Freesound
// item has `category: null` — so filtering by category silently drops most
// results. Filter by source instead.
const SOURCE_PRESETS = {
    sfx: 'freesound',
    music: 'jamendo,wikimedia_audio',
    speech: 'wikimedia_audio',
}

const LICENSE_LABELS = {
    'cc0': 'CC0 1.0 (public domain dedication)',
    'pdm': 'Public Domain Mark',
    'by': 'CC BY',
    'by-sa': 'CC BY-SA',
    'by-nc': 'CC BY-NC',
    'by-nd': 'CC BY-ND',
    'by-nc-sa': 'CC BY-NC-SA',
    'by-nc-nd': 'CC BY-NC-ND',
    'sampling+': 'Sampling Plus',
    'nc-sampling+': 'NonCommercial Sampling Plus',
}

function licenseObligations(license) {
    const obligations = []
    if (!['cc0', 'pdm'].includes(license))
        obligations.push('credit the creator')
    if (license.includes('nc'))
        obligations.push('NON-COMMERCIAL use only')
    if (license.includes('nd'))
        obligations.push('no edits or derivatives')
    if (license.includes('sa'))
        obligations.push('share adaptations under the same license')
    return obligations
}

function parseArguments(argv) {
    const positional = []
    const flags = {}
    for (let index = 0; index < argv.length; index++) {
        const token = argv[index]
        if (!token.startsWith('--')) {
            positional.push(token)
            continue
        }
        const name = token.slice(2)
        const next = argv[index + 1]
        if (next === undefined || next.startsWith('--')) {
            flags[name] = true
        }
        else {
            flags[name] = next
            index++
        }
    }
    return { positional, flags }
}

// Sound effects are routinely under a second, so seconds-with-decimals beats
// mm:ss below the ten-second mark.
function formatDuration(milliseconds) {
    if (!milliseconds)
        return '?:??'
    if (milliseconds < 10_000)
        return `${(milliseconds / 1000).toFixed(1)}s`
    const totalSeconds = Math.round(milliseconds / 1000)
    return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, '0')}`
}

function formatSize(bytes) {
    if (!bytes)
        return 'size ?'
    if (bytes < 1024 * 1024)
        return `${Math.round(bytes / 1024)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

// Openverse hands back Jamendo's storage URL without the `from` parameter its
// CDN requires, so a plain GET answers 403. Adding it returns the full track.
function resolveDownloadUrl(result) {
    if (result.provider === 'jamendo' && !result.url.includes('from='))
        return `${result.url}&from=app-devsite`
    return result.url
}

// The real extension lives in the URL when there is one — Openverse's own
// `filetype` reports Jamendo bitrate variants as `mp32` and Wikimedia Ogg files
// as `ogx`, neither of which is a usable file extension.
function resolveExtension(result) {
    const urlExtension = new URL(result.url).pathname.split('.').pop().toLowerCase()
    if (/^(mp3|ogg|oga|wav|flac|m4a|aac|opus)$/.test(urlExtension))
        return urlExtension

    const fileType = (result.filetype || '').toLowerCase()
    if (fileType.startsWith('mp3'))
        return 'mp3'
    if (fileType.startsWith('og'))
        return 'ogg'
    return fileType || 'mp3'
}

function slugify(text) {
    return text
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/\.[a-z0-9]{2,5}$/, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 60) || 'audio'
}

async function callOpenverse(url) {
    const response = await fetch(url, { headers: REQUEST_HEADERS })
    const remainingToday = response.headers.get('x-ratelimit-available-anon_sustained')

    if (response.status === 429) {
        throw new Error('Openverse rate limit hit (anonymous: 20/min, 200/day). Wait a minute, or register a key: https://api.openverse.org/v1/auth_tokens/register/')
    }
    if (!response.ok) {
        const body = await response.text()
        throw new Error(`Openverse ${response.status}: ${body.slice(0, 300)}`)
    }
    if (remainingToday !== null && Number(remainingToday) < 20)
        process.stderr.write(`warning: only ${remainingToday} anonymous Openverse requests left today\n`)

    return response.json()
}

async function search(positional, flags) {
    const query = positional.join(' ').trim()
    if (!query)
        throw new Error('Usage: audio.mjs search <query> [--sfx|--music] [--cc0] [--commercial] [--license csv] [--source csv] [--length short] [--limit N] [--json]')

    const url = new URL(OPENVERSE_AUDIO)
    url.searchParams.set('q', query)
    url.searchParams.set('page_size', String(Math.min(Number(flags.limit) || 10, 20)))

    const presetSource = ['sfx', 'music', 'speech'].find(preset => flags[preset])
    const source = flags.source || (presetSource ? SOURCE_PRESETS[presetSource] : null)
    if (source)
        url.searchParams.set('source', source)

    if (flags.cc0)
        url.searchParams.set('license', 'cc0')
    else if (flags.license)
        url.searchParams.set('license', flags.license)

    if (flags.commercial)
        url.searchParams.set('license_type', 'commercial')
    if (flags.length)
        url.searchParams.set('length', flags.length)
    if (flags.page)
        url.searchParams.set('page', flags.page)

    const payload = await callOpenverse(url)
    const results = payload.results || []

    await mkdir(CACHE_DIRECTORY, { recursive: true })
    await writeFile(LAST_SEARCH_FILE, JSON.stringify(results, null, 2))

    if (flags.json) {
        console.log(JSON.stringify(results, null, 2))
        return
    }

    if (!results.length) {
        console.log(`No results for "${query}". Try fewer filters — --cc0 and --license are strict, and Jamendo carries almost no CC0.`)
        return
    }

    console.log(`${payload.result_count} results for "${query}" — showing ${results.length}\n`)
    results.forEach((result, index) => {
        const obligations = licenseObligations(result.license)
        console.log(`${String(index + 1).padStart(2)}. ${result.title}`)
        console.log(`    ${result.provider} · ${LICENSE_LABELS[result.license] || result.license} ${result.license_version || ''} · ${formatDuration(result.duration)} · ${resolveExtension(result)} · ${formatSize(result.filesize)}`)
        console.log(`    ${obligations.length ? `must: ${obligations.join('; ')}` : 'no strings attached'}`)
        console.log(`    ${result.foreign_landing_url}`)
    })
    console.log(`\nDownload with:  audio.mjs get 1 3 --out ./assets/audio`)
}

async function resolveTargets(positional) {
    let lastSearch = []
    try {
        lastSearch = JSON.parse(await readFile(LAST_SEARCH_FILE, 'utf8'))
    }
    catch {
        lastSearch = []
    }

    const targets = []
    for (const token of positional) {
        if (/^\d+$/.test(token)) {
            const result = lastSearch[Number(token) - 1]
            if (!result)
                throw new Error(`No result #${token} in the last search (it had ${lastSearch.length}). Run search again.`)
            targets.push(result)
            continue
        }
        const detail = await callOpenverse(`${OPENVERSE_AUDIO}${encodeURIComponent(token)}/`)
        targets.push(detail)
    }
    return targets
}

async function downloadFile(url, destination) {
    const response = await fetch(url, {
        headers: { 'User-Agent': REQUEST_HEADERS['User-Agent'] },
        redirect: 'follow',
    })
    if (!response.ok)
        throw new Error(`download failed: HTTP ${response.status}`)

    const contentType = response.headers.get('content-type') || ''
    if (!/audio|ogg|octet-stream|video\/ogg/i.test(contentType))
        throw new Error(`refusing to save non-audio response (content-type: ${contentType})`)

    await pipeline(Readable.fromWeb(response.body), createWriteStream(destination))
}

async function writeCredits(outputDirectory, manifest) {
    const requiringCredit = manifest.filter(entry => licenseObligations(entry.license).includes('credit the creator'))
    const publicDomain = manifest.filter(entry => !licenseObligations(entry.license).includes('credit the creator'))
    const restricted = manifest.filter(entry => entry.license.includes('nc') || entry.license.includes('nd'))

    const lines = [
        '# Audio credits',
        '',
        'Generated by the `free-audio` skill. Keep this file shipped alongside the audio.',
        '',
    ]

    if (requiringCredit.length) {
        lines.push('## Attribution required', '')
        for (const entry of requiringCredit)
            lines.push(`- **${entry.file}** — ${entry.attribution}`, `  Source: ${entry.landingUrl}`, '')
    }
    if (publicDomain.length) {
        lines.push('## Public domain (no attribution required)', '')
        for (const entry of publicDomain)
            lines.push(`- **${entry.file}** — "${entry.title}" by ${entry.creator} (${LICENSE_LABELS[entry.license] || entry.license})`, `  Source: ${entry.landingUrl}`, '')
    }
    if (restricted.length) {
        lines.push('## ⚠️ Usage restrictions', '')
        for (const entry of restricted)
            lines.push(`- **${entry.file}** — ${licenseObligations(entry.license).join('; ')}`)
        lines.push('')
    }

    await writeFile(path.join(outputDirectory, CREDITS_FILENAME), lines.join('\n'))
}

async function get(positional, flags) {
    if (!positional.length)
        throw new Error('Usage: audio.mjs get <index|openverse-id> [...] [--out ./assets/audio]')

    const outputDirectory = path.resolve(flags.out || './audio')
    await mkdir(outputDirectory, { recursive: true })

    const manifestPath = path.join(outputDirectory, MANIFEST_FILENAME)
    let manifest = []
    try {
        manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
    }
    catch {
        manifest = []
    }

    const targets = await resolveTargets(positional)

    for (const result of targets) {
        if (manifest.some(entry => entry.id === result.id)) {
            console.log(`= already have "${result.title}"`)
            continue
        }

        const fileName = `${slugify(result.title)}-${result.id.slice(0, 6)}.${resolveExtension(result)}`
        const destination = path.join(outputDirectory, fileName)

        try {
            await downloadFile(resolveDownloadUrl(result), destination)
        }
        catch (error) {
            console.log(`✗ ${result.title} — ${error.message}`)
            console.log(`  get it manually: ${result.foreign_landing_url}`)
            continue
        }

        manifest.push({
            id: result.id,
            file: fileName,
            title: result.title,
            creator: result.creator,
            provider: result.provider,
            license: result.license,
            licenseVersion: result.license_version,
            licenseUrl: result.license_url,
            landingUrl: result.foreign_landing_url,
            attribution: result.attribution,
        })

        const obligations = licenseObligations(result.license)
        console.log(`✓ ${fileName}`)
        console.log(`  ${LICENSE_LABELS[result.license] || result.license} — ${obligations.length ? obligations.join('; ') : 'no strings attached'}`)
    }

    await writeFile(manifestPath, JSON.stringify(manifest, null, 2))
    await writeCredits(outputDirectory, manifest)
    console.log(`\n${manifest.length} file(s) in ${outputDirectory} · credits written to ${CREDITS_FILENAME}`)
}

async function credits(_positional, flags) {
    const outputDirectory = path.resolve(flags.out || './audio')
    const manifest = JSON.parse(await readFile(path.join(outputDirectory, MANIFEST_FILENAME), 'utf8'))
    await writeCredits(outputDirectory, manifest)
    console.log(await readFile(path.join(outputDirectory, CREDITS_FILENAME), 'utf8'))
}

const COMMANDS = { search, get, credits }

const [command, ...rest] = process.argv.slice(2)
const { positional, flags } = parseArguments(rest)

if (!COMMANDS[command]) {
    console.log(`free-audio — CC-licensed sound effects and music, no API key

  audio.mjs search <query> [--sfx|--music|--speech] [--cc0] [--commercial]
                           [--license csv] [--source csv] [--length shortest|short|medium|long]
                           [--limit N] [--page N] [--json]
  audio.mjs get <index|id> [...] [--out ./assets/audio]
  audio.mjs credits [--out ./assets/audio]`)
    process.exit(command ? 1 : 0)
}

COMMANDS[command](positional, flags).catch((error) => {
    console.error(`error: ${error.message}`)
    process.exit(1)
})

import { createFixtures, demoAudio } from './fixtures'

type Row = Record<string, any>
type Request = { url?: string; method?: string; params?: Row; data?: any }

export function createShowcaseApi() {
  const { user, calls, clients, locations, procedures } = createFixtures()
  const meta: Record<string, string> = { is_dark: 'false' }
  const scores = new Map<number, Row>()
  calls.filter(call => call.rated).forEach(call => scores.set(call.id, {
    call_status: 'live_answer_booked',
    booked_appointment: 'yes',
    can_understand: 'yes',
    person_name: call.caller_name,
    person_email: call.caller_name.toLowerCase().replace(' ', '.') + '@example.test',
    person_phone: call.caller_number,
    appt_date: call.call_date,
    appt_time: '16:30',
    identify_office: 'yes',
    recipient_identify_themselves: 'yes',
    recipient_name: 'Robin Hayes',
    consult_offered: 'yes',
    handler_pitch: 'yes',
    caller_name_taken: 'yes',
    comment: 'Confirmed the next step and offered two appointment times.',
    procedure: procedures[0],
    scorer: user,
  }))

  function page(rows: Row[], query: Row) {
    const limit = Math.max(1, Number(query.limit) || 20)
    const current_page = Math.max(1, Number(query.page) || 1)
    return { result: rows.slice((current_page - 1) * limit, current_page * limit),
      pagination: { current_page, total: rows.length, total_pages: Math.max(1, Math.ceil(rows.length / limit)), per_page: limit } }
  }

  function matchesDates(row: Row, from: string, to: string) {
    return (!from || row.call_date >= from) && (!to || row.call_date <= to)
  }

  function resolve(config: Request) {
    const url = new URL(config.url || '', 'https://showcase.example.test')
    const [resource, id, action] = url.pathname.split('/').filter(Boolean)
    const query: Row = {}
    url.searchParams.forEach((value, key) => { query[key] = value })
    Object.assign(query, config.params)
    const body: Row = typeof config.data === 'string' ? JSON.parse(config.data) : config.data || {}
    const method = (config.method || 'get').toLowerCase()
    if (['ping', 'sanctum', 'login', 'logout', 'password-reset', 'reset'].includes(resource)) return {}
    if (resource === 'user') return user
    if (resource === 'users' && id === '1') {
      if (method === 'put') {
        if (typeof body.first_name === 'string') user.first_name = body.first_name
        if (typeof body.last_name === 'string') user.last_name = body.last_name
        user.fullname = user.first_name + ' ' + user.last_name
      }
      return user
    }
    if (resource === 'meta') {
      if (method === 'put' && id) meta[id] = String(body.meta_value ?? body.value)
      return { data: Object.entries(meta).map(([meta_name, meta_value]) => ({ meta_name, meta_value })) }
    }
    if (resource === 'roles') return [{ id: 1, name: 'super admin' }, { id: 2, name: 'admin' }, { id: 3, name: 'call scorer' }]
    if (resource === 'procedures') return procedures
    if (resource === 'player') return { call_url: demoAudio }
    if (resource === 'reports' && query.type === 'payment') {
      const ratings = clients.map(client => {
        const rated = calls.filter(call => call.client_id === client.id && call.rated &&
          !call.blacklisted && matchesDates(call, query.from, query.to))
        return { id: client.id, name: client.name, total_calls: rated.length, total_call_duration: rated.reduce((sum, row) => sum + row.call_duration, 0), total_rating_time: rated.length * 45 }
      }).filter(row => row.total_calls)
      return { ratings, pay_rate: 18 }
    }
    if (resource === 'clients' && !id) {
      const name = String(query.name || '').toLowerCase().trim()
      return page(clients.filter(client => client.name.toLowerCase().includes(name)), query)
    }
    if (resource === 'locations' || (resource === 'clients' && action === 'locations')) {
      if (resource === 'locations' && id) {
        const location = locations.find(row => row.id === Number(id))
        return action === 'campaigns' ? location?.campaigns : location
      }
      const rows = locations.filter(row => resource === 'locations' || row.client_id === Number(id)).map(row => ({
        ...row, unrated_calls: calls.filter(call => call.location_id === row.id && !call.rated && !call.blacklisted).length,
      }))
      return page(rows, query)
    }
    if (resource === 'calls') {
      if (id) {
        const call = calls.find(row => row.id === Number(id))
        if (!call) return undefined
        if (action === 'score' && method === 'get') return scores.get(call.id) || null
        if (action === 'score' || action === 'blacklist') {
          call.rated = true
          if (action === 'blacklist') call.blacklisted = true
          scores.set(call.id, { ...body, scorer: user, procedure: procedures.find(row => row.id === Number(body.procedure_id)) })
          return { call_id: calls.find(row => row.location_id === call.location_id && !row.rated && !row.blacklisted)?.id || null }
        }
        return call
      }
      const [from, to] = String(query.date_range || '').split(',')
      const rows = calls.filter(call => !call.blacklisted &&
        (!query.client || call.client_id === Number(query.client)) &&
        (!query.location || call.location_id === Number(query.location)) &&
        (!query.campaign || call.campaign.f_campaign_id === String(query.campaign)) &&
        (!query.rated || call.rated) && (!query.unrated || !call.rated) &&
        (!query.score_language || query.score_language === 'all' || call.language === String(query.score_language).toLowerCase()) &&
        matchesDates(call, from, to))
      const [column, direction] = String(query.sort_by || '').split(':')
      if (['id', 'caller_number', 'call_start', 'call_duration', 'rated'].includes(column)) {
        const key = column as keyof typeof rows[number]
        rows.sort((a, b) => String(a[key]).localeCompare(String(b[key]), 'en', { numeric: true }) * (direction === 'desc' ? -1 : 1))
      } else if (query.order_by === 'oldest') rows.reverse()
      return page(rows, query)
    }
    return undefined
  }

  async function adapter(config: Request) {
    const value = resolve(config)
    const response = { config, headers: {}, status: value === undefined ? 404 : 200,
      statusText: value === undefined ? 'Not Found' : 'OK',
      data: value === undefined ? { message: 'Showcase record not found' } : { data: JSON.parse(JSON.stringify(value)) } }
    if (value === undefined) throw Object.assign(new Error('Showcase record not found'), { response, config })
    return response
  }

  return { adapter, session: () => ({ ...user, scope: [...user.scope] }) }
}

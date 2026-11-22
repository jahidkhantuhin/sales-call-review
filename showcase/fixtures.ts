export const demoAudio = '/showcase-call.wav'

export function demoDate(offset = 0) {
  return new Date(Date.now() + offset * 86400000).toISOString().slice(0, 10)
}

export function createFixtures() {
  const user = {
    id: 1, first_name: 'Jahid', last_name: 'Khan', fullname: 'Jahid Khan',
    email: 'jahid@example.test', role: 'super admin', role_id: 1, status: 1,
    scope: ['view calls', 'view clients', 'score call'],
  }
  const clients = ['Northstar Dental', 'Harborview Wellness', 'Cedar Grove Plumbing'].map((name, index) => ({
    id: index + 1, name, source: 'marchex', account_id: 'DEMO-' + (101 + index), created_at: demoDate(-36) + 'T15:00:00Z',
  }))
  const locations = ['Northstar Downtown', 'Harborview East', 'Cedar Grove Main', 'Northstar West'].map((name, index) => ({
    id: index + 1, name, client: clients[index % 3], client_id: clients[index % 3].id,
    campaigns: [{ id: index + 1, f_campaign_id: String(index + 1), name: name + ' intake' }],
  }))
  const procedures = [
    { id: 1, name: 'Consultation' }, { id: 2, name: 'New patient visit' }, { id: 3, name: 'Service estimate' },
  ]
  const callers = ['Alex Morgan', 'Taylor Brooks', 'Morgan Price', 'Sam Ellis', 'Jamie Rivera', 'Casey Nguyen']
  const calls = Array.from({ length: 28 }, (_, index) => {
    const location = locations[index % locations.length]
    const call_date = demoDate(-Math.floor(index / 2))
    const call_time = index % 2 ? '14:30:00' : '16:15:00'
    const start = call_date + 'T' + call_time + 'Z'
    return {
      id: 2048 - index, caller_name: callers[index % callers.length], caller_number: '20255501' + (10 + index),
      call_date, call_time, call_start: start, call_end: new Date(Date.parse(start) + 30000).toISOString(),
      call_duration: 30, call_url: demoAudio, url: demoAudio, marchex_call_id: 'DEMO-' + (2048 - index),
      client_id: location.client_id, client: location.client, location_id: location.id, location,
      campaign: location.campaigns[0], rated: index % 3 === 1, blacklisted: false, language: index % 7 === 3 ? 'spanish' : 'english',
    }
  })
  return { user, clients, locations, procedures, calls }
}

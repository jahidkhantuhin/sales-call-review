const { createShowcaseApi } = require('../showcase/api')

describe('showcase call review', () => {
  test('filters the queue by location and paginates matching calls', async () => {
    const { adapter } = createShowcaseApi()
    const response = await adapter({ url: '/calls?location=1&page=2&limit=2' })
    const { result, pagination } = response.data.data

    expect(result.map((call) => call.id)).toEqual([2040, 2036])
    expect(result.every((call) => call.location_id === 1)).toBe(true)
    expect(pagination).toMatchObject({ total: 7, current_page: 2 })
  })

  test('keeps a saved score in the current adapter and resets it in a new instance', async () => {
    const { adapter } = createShowcaseApi()
    const url = '/calls/2048/score'

    await adapter({ url, method: 'post', data: { procedure_id: 2, call_status: 'live_answer_booked' } })

    const saved = await adapter({ url })
    expect(saved.data.data).toMatchObject({
      call_status: 'live_answer_booked',
      procedure: { id: 2 },
    })

    const fresh = await createShowcaseApi().adapter({ url })
    expect(fresh.data.data).toBeNull()
  })

  test('returns a local 404 for an unseeded call', async () => {
    await expect(createShowcaseApi().adapter({ url: '/calls/9999' })).rejects.toMatchObject({
      response: { status: 404 },
    })
  })
})

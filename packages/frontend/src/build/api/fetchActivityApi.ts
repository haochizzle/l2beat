import { layer2s as allLayer2s, layer3s as allLayer3s } from '@l2beat/config'
import {
  ActivityApiChart,
  ActivityApiChartsWithEstimation,
  ActivityApiResponse,
  UnixTime,
} from '@l2beat/shared-pure'

import { JsonHttpClient } from '../caching/JsonHttpClient'
import { Config } from '../config'

export async function fetchActivityApi(
  backend: Config['backend'],
  http: JsonHttpClient,
): Promise<ActivityApiResponse> {
  if (backend.mock) {
    return getMockActivityApiResponse()
  }
  const url = backend.apiUrl + '/api/activity'
  const json = await http.fetchJson(url)
  return ActivityApiResponse.parse(json)
}

function getMockActivityApiResponse(): ActivityApiResponse {
  const result: ActivityApiResponse = {
    combined: getMockActivityApiChart(),
    projects: {},
  }
  for (const project of [
    ...allLayer2s.filter((l2) => !l2.isArchived && !l2.isUpcoming),
    ...allLayer3s.filter((l3) => !l3.isUpcoming),
  ]) {
    result.projects[project.id.toString()] = getMockActivityApiChart()
  }
  return result
}

function getMockActivityApiChart(): ActivityApiChartsWithEstimation {
  const now = UnixTime.now().toStartOf('day')
  const chart: ActivityApiChart = {
    types: ['timestamp', 'transactions', 'ethereumTransactions'],
    data: [],
  }
  for (let i = -365; i <= 0; i++) {
    const timestamp = now.add(i, 'days')
    chart.data.push([timestamp, 50, 20])
  }
  return {
    daily: chart,
    estimatedImpact: 0,
    estimatedSince: now.add(1, 'days'),
  }
}

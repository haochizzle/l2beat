import { Logger } from '@l2beat/backend-tools'
import { HttpClient } from '@l2beat/shared'
import { ProjectId } from '@l2beat/shared-pure'

import { Config } from '../../config'
import { ActivityConfig } from '../../config/Config'
import { Database } from '../../peripherals/database/Database'
import { Clock } from '../../tools/Clock'
import { ApplicationModule } from '../ApplicationModule'
import { ActivityViewRefresher } from './ActivityViewRefresher'
import { ActivityController } from './api/ActivityController'
import { createActivityRouter } from './api/ActivityRouter'
import { createSequenceProcessors } from './createSequenceProcessors'
import { ActivityViewRepository } from './repositories/ActivityViewRepository'
import { SequenceProcessor } from './SequenceProcessor'

export function createActivityModule(
  config: Config,
  logger: Logger,
  http: HttpClient,
  database: Database,
  clock: Clock,
): ApplicationModule | undefined {
  if (!config.activity) {
    logger.info('Activity module disabled')
    return
  }

  const activityViewRepository = new ActivityViewRepository(database, logger)

  const processors = createSequenceProcessors(
    config,
    logger,
    http,
    database,
    clock,
  )

  const viewRefresher = new ActivityViewRefresher(
    processors,
    activityViewRepository,
    clock,
    logger,
  )

  const includedInApiProjectIds = getIncludedInApiProjectIds(
    processors,
    config.activity,
    logger,
  )
  const activityController = new ActivityController(
    includedInApiProjectIds,
    processors,
    activityViewRepository,
    clock,
  )
  const activityV2Router = createActivityRouter(activityController, config)

  const start = async () => {
    logger = logger.for('ActivityModule')
    logger.info('Starting')
    await Promise.all(processors.map((p) => p.start()))
    viewRefresher.start()
    logger.info('Started')
  }

  return {
    routers: [activityV2Router],
    start,
  }
}

function getIncludedInApiProjectIds(
  processors: SequenceProcessor[],
  activity: ActivityConfig,
  logger: Logger,
): ProjectId[] {
  return processors
    .filter((processor) =>
      shouldIncludeProject(processor.projectId, activity, logger),
    )
    .map((c) => c.projectId)
}

export function shouldIncludeProject(
  projectId: ProjectId,
  activity: ActivityConfig,
  logger: Logger,
) {
  const isExcludedInEnv = activity.projectsExcludedFromAPI.some(
    (p) => p === projectId.toString(),
  )
  if (isExcludedInEnv) {
    logger.info(
      `Project ${projectId.toString()} excluded from activity v2 api via .env - will not be present in the response, but will continue syncing`,
    )
    return false
  }

  return true
}

import { $schemaDatasourceIds, $schemaGeneratorIds } from '@renderer/modules/editor'
import { useList } from 'effector-react'
import { SettingsSection } from '../../SettingsSection'
import { PrismaDatasourceSettings } from './PrismaDatasourceSettings'
import { PrismaGeneratorSettings } from './PrismaGeneratorSettings'

export const PrismaSchemaProjectSettings = () => {
  const datasources = useList($schemaDatasourceIds, (id) => (
    <PrismaDatasourceSettings settingsId={id} />
  ))

  const generators = useList($schemaGeneratorIds, (id) => (
    <PrismaGeneratorSettings settingsId={id} />
  ))

  return (
    <SettingsSection>
      {datasources}
      {generators}
    </SettingsSection>
  )
}

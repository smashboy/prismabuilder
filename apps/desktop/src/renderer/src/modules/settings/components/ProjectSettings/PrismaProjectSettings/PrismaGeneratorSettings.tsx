import { useStore, useStoreMap } from 'effector-react'
import { MultiSelect, Stack } from '@mantine/core'
import { SettingsSectionPaper } from '../../SettingsSectionPaper'
import { EnvInput } from '../../EnvInput'
import { cleanupAssignmentValue, extractAssignmentValue } from '@renderer/modules/settings/utils'
import { $schemaGenerators } from '@renderer/modules/editor'
import { Assignment, RelationArray } from '@mrleebo/prisma-ast'
import { $prismaSettings } from '@renderer/modules/settings/stores'

interface PrismaDatasourceSettingsProps {
  settingsId: string
}

export const PrismaGeneratorSettings: React.FC<PrismaDatasourceSettingsProps> = ({
  settingsId
}) => {
  const { previewFeaturesList } = useStore($prismaSettings)

  const { assignments: lines } = useStoreMap({
    store: $schemaGenerators,
    keys: [settingsId],
    fn: (settings, [id]) => settings.get(id)!
  })

  const assignments = lines.filter((a) => a.type === 'assignment') as Assignment[]

  const provider = assignments.find((a) => a.key === 'provider') || {
    type: 'assignment',
    key: 'provider',
    value: ''
  }

  const output = assignments.find((a) => a.key === 'output') || {
    type: 'assignment',
    key: 'output',
    value: ''
  }

  const previewFeatures = assignments.find((a) => a.key === 'previewFeatures') || {
    type: 'assignment',
    key: 'previewFeatures',
    value: {
      type: 'array',
      args: []
    }
  }

  const selectedPreviewFeatures = (previewFeatures.value as RelationArray).args.map(
    cleanupAssignmentValue
  )

  const providerInput = extractAssignmentValue(provider)
  const outputInput = extractAssignmentValue(output)

  const previewFeaturesOptions = Array.from(
    new Set([...selectedPreviewFeatures, ...previewFeaturesList])
  )

  return (
    <SettingsSectionPaper>
      <Stack>
        {/* <Text>{settingsId}</Text> */}
        <EnvInput
          label="Provider"
          description="Describes which generator  to use. This can point to a file that implements a generator or specify a built-in generator directly."
          value={providerInput.value}
          isEnv={providerInput.isEnv}
          required
        />
        <EnvInput
          label="Output"
          description="Determines the location for the generated client. Default: node_modules/.prisma/client"
          value={outputInput.value}
          isEnv={outputInput.isEnv}
        />
        <MultiSelect
          label="Preview features"
          value={selectedPreviewFeatures}
          data={previewFeaturesOptions}
        />
      </Stack>
    </SettingsSectionPaper>
  )
}

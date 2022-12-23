import { Accordion, Text } from '@mantine/core'
import {
  $isUpdatingProject,
  $selectedProject,
  $selectedProjectCommands,
  updateProjectEffect
} from '@renderer/modules/projects'
import { PrismaCommand } from '@shared/common/models/Prisma'
import { combine } from 'effector'
import { useStore, useStoreMap } from 'effector-react'
import { PrismaCommandForm } from './PrismaCommandForm'

interface EditPrismaCommandFormProps {
  commandId: string
}

const $store = combine({
  project: $selectedProject,
  isLoading: $isUpdatingProject
})

export const EditPrismaCommandForm: React.FC<EditPrismaCommandFormProps> = ({ commandId }) => {
  const { project, isLoading } = useStore($store)

  const command = useStoreMap({
    store: $selectedProjectCommands,
    keys: [commandId],
    fn: (commands, [id]) => commands.get(id)!
  })

  const { name } = command

  const handleSaveChanges = (updatedCommand: PrismaCommand) =>
    updateProjectEffect({
      ...project,
      commands: { ...project?.commands, [commandId]: updatedCommand }
    })

  return (
    <Accordion.Item value={commandId}>
      <Accordion.Control>
        <Text>{name}</Text>
      </Accordion.Control>
      <Accordion.Panel>
        <PrismaCommandForm
          defaultValues={command}
          onSubmit={handleSaveChanges}
          isLoading={isLoading}
        />
      </Accordion.Panel>
    </Accordion.Item>
  )
}

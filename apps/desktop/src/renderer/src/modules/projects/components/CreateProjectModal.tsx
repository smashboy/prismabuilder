import { useState } from 'react'
import { combine } from 'effector'
import { useStore } from 'effector-react'
import { Button, Group, Modal, Stack } from '@mantine/core'
import { $isOpenCreateProjectModal, toggleCreateProjectModal } from '@renderer/stores/ui/modals'
import { $isCreatingProject, createProjectEffect } from '../stores'
import { ProjectFormBase, ProjectFormBaseValues } from './ProjectFormBase'

const $store = combine({
  isOpen: $isOpenCreateProjectModal,
  isCreatingProject: $isCreatingProject
})

const initialFormValues: ProjectFormBaseValues = {
  name: '',
  schema: '',
  projectDirectory: ''
}

export const CreateProjectModal = () => {
  const { isOpen, isCreatingProject } = useStore($store)

  const [project, setProject] = useState<ProjectFormBaseValues>(initialFormValues)

  const { name, schema, projectDirectory } = project

  const handleCloseDialog = () => {
    toggleCreateProjectModal(false)
    setProject(initialFormValues)
  }

  const handleCreateProject = async () => {
    await createProjectEffect({
      name,
      schema,
      projectDirectory: projectDirectory ?? void 0
    })

    handleCloseDialog()
  }

  const disableCreateButton = !schema || !name

  return (
    <Modal opened={isOpen} onClose={handleCloseDialog} title="Create project">
      <Stack>
        <ProjectFormBase values={project} onChange={setProject} />
        <Group position="right">
          <Button variant="subtle" color="gray" onClick={handleCloseDialog}>
            Cancel
          </Button>
          <Button
            variant="filled"
            onClick={handleCreateProject}
            loading={isCreatingProject}
            disabled={disableCreateButton}
          >
            Create
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}

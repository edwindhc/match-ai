import { Payload } from 'payload'
import { TechnologiesSeed } from './Technologies.seed'
import { ProjectsSeed } from './Projects.seed'
import { EmployeesSeed } from './Employees.seed'
import { AssignmentsSeed } from './Assignments.seed'

export const Seeds = async (payload: Payload) => {
  console.log('Seeds')
  await TechnologiesSeed(payload)
  await ProjectsSeed(payload)
  await EmployeesSeed(payload)
  await AssignmentsSeed(payload)
}

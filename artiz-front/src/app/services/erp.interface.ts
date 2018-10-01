import Project from '../models/project.model';

export interface Erp {
  projectSyncFromFront(project: Project);
  projectBuildPdfFromFront(proposalId);
  projectGetPdfFromFront(proposalId);
}

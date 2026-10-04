import { describe, expect, it, vi } from 'vitest';
vi.mock('../src/db/prisma',()=>({getPrisma:vi.fn()}));
import { getPrisma } from '../src/db/prisma'; import { updateExperience,deleteEducation,updateSkill,getPreferences } from '../src/modules/candidates/candidate.service';
const db:any={candidateProfile:{findUnique:vi.fn().mockResolvedValue({id:'profile-a'})},experience:{updateMany:vi.fn().mockResolvedValue({count:0})},education:{deleteMany:vi.fn().mockResolvedValue({count:0})},candidateSkill:{updateMany:vi.fn().mockResolvedValue({count:0})},candidatePreference:{findUnique:vi.fn()}};
vi.mocked(getPrisma).mockReturnValue(db);
describe('candidate ownership boundaries',()=>{
 it('scopes experience updates to the authenticated profile',async()=>{await expect(updateExperience('user-a','experience-b',{})).rejects.toMatchObject({code:'RESOURCE_NOT_FOUND'});expect(db.experience.updateMany).toHaveBeenCalledWith({where:{id:'experience-b',profileId:'profile-a'},data:{}});});
 it('scopes education deletes to the authenticated profile',async()=>{await expect(deleteEducation('user-a','education-b')).rejects.toMatchObject({code:'RESOURCE_NOT_FOUND'});expect(db.education.deleteMany).toHaveBeenCalledWith({where:{id:'education-b',profileId:'profile-a'}});});
 it('scopes skill updates to the authenticated profile',async()=>{await expect(updateSkill('user-a','skill-b',{proficiency:4})).rejects.toMatchObject({code:'RESOURCE_NOT_FOUND'});expect(db.candidateSkill.updateMany).toHaveBeenCalledWith({where:{id:'skill-b',profileId:'profile-a'},data:{proficiency:4}});});
 it('resolves preferences only through authenticated profile',async()=>{await getPreferences('user-a');expect(db.candidatePreference.findUnique).toHaveBeenCalledWith({where:{profileId:'profile-a'}});});
});

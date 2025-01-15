import { Endpoint } from 'payload'
import { onboardedMembersLists, onboardMember, removeMember } from './onboardMembers'
import { getPublicData, updateProfile } from './getMyData'
import { getUser } from './getUser'
import { disableApiKey, enableApikey, generateNewApiKey, getApiKey } from './apiKey'

const endpoints: Omit<Endpoint, 'root'>[] = [
  {
    method: 'post',
    path: '/onboard-Member',
    handler: onboardMember,
  },
  {
    method: 'get',
    path: '/onboarded-members-list',
    handler: onboardedMembersLists,
  },
  {
    method: 'post',
    path: '/remove-member',
    handler: removeMember,
  },
  {
    method: 'get',
    path: '/getUser',
    handler: getUser,
  },
  {
    method: 'post',
    path: '/getPublicData',
    handler: getPublicData,
  },
  {
    method: 'get',
    path: '/enableApikey',
    handler: enableApikey,
  },
  {
    method: 'get',
    path: '/getApiKey',
    handler: getApiKey,
  },
  {
    method: 'get',
    path: '/newApiKey',
    handler: generateNewApiKey,
  },
  {
    method: 'get',
    path: '/disableApikey',
    handler: disableApiKey,
  },
  {
    method: 'post',
    path: '/updateProfile',
    handler: updateProfile,
  },
]
export default endpoints

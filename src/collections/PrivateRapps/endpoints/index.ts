import { Endpoint } from 'payload'
import createRapp from './createRapp'
import runRapp from './runRapp'
import {
  getMemberRapps,
  getPromptBySlug,
  getRappById,
  getRappBySlug,
  getRapps,
  updateAccess,
  updatePermissions,
  updatePrompts,

} from './getRapps'
import { updateAccessList, updateAccessUsers } from './updateRapp'
import { purchaseRapps } from './privateRappPurchase'
import deleteRapp from './deleteRapp'

const endpoints: Omit<Endpoint, 'root'>[] = [
  {
    method: 'post',
    path: '/create',
    handler: createRapp,
  },
  {
    method: 'post',
    path: '/run',
    handler: runRapp,
  },
  {
    method: 'get',
    path: '/getRapps',
    handler: getRapps,
  },
  {
    method: 'get',
    path: '/:slug',
    handler: getRappBySlug,
  },
  {
    method: 'get',
    path: '/getPromptBySlug/:slug',
    handler: getPromptBySlug,
  },
  {
    method: 'post',
    path: '/getMemberRapps',
    handler: getMemberRapps,
  },
  {
    method: 'get',
    path: '/getRappById/:id',
    handler: getRappById,
  },
  {
    method: 'post',
    path: '/updatePrivateRapps/:id',
    handler: updateAccess,
  },
  {
    method: 'post',
    path: '/updatePermissions/:id',
    handler: updatePermissions,
  },
  {
    method: 'post',
    path: '/updateAccessList/:id',
    handler: updateAccessList,
  },
  {
    method: 'post',
    path: '/updateAccessUsers',
    handler: updateAccessUsers,
  },
  {
    method: 'post',
    path: '/purchase',
    handler: purchaseRapps,
  },
  {
    method: 'delete',
    path: '/deleteRapp',
    handler: deleteRapp,
  },
  {
    method: 'post',
    path: '/updatePrompts/:id',
    handler:updatePrompts
  },
]
export default endpoints

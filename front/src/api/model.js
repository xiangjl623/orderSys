import request from '@/utils/request'

export function getModelList(params) {
  return request({
    url: '/model/list',
    method: 'get',
    params
  })
}
export function addModel(data) {
  return request({
    url: '/model/add',
    method: 'post',
    data
  })
}
export function updateModel(data) {
  return request({
    url: '/model/update',
    method: 'post',
    data
  })
}
export function delModel(params) {
  return request({
    url: '/model/delete',
    method: 'delete',
    params
  })
}

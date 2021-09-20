import request from '@/utils/request'

export function getCompanyList(params) {
  return request({
    url: '/company/list',
    method: 'get',
    params
  })
}
export function updateCompany(data) {
  return request({
    url: '/company/update',
    method: 'post',
    data
  })
}
export function delCompany(params) {
  return request({
    url: '/company/delete',
    method: 'delete',
    params
  })
}
export function addCompany(data) {
  return request({
    url: '/company/add',
    method: 'post',
    data
  })
}

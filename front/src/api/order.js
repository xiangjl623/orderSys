import request from '@/utils/request'

export function getOrderList(params) {
  return request({
    url: '/order/list',
    method: 'get',
    params
  })
}
export function addOrder(data) {
  return request({
    url: '/order/add',
    method: 'post',
    data
  })
}
export function updateOrder(data) {
  return request({
    url: '/order/update',
    method: 'post',
    data
  })
}
export function delOrder(params) {
  return request({
    url: '/order/delete',
    method: 'delete',
    params
  })
}

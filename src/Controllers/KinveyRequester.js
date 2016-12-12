import {api} from '../api.js'
import $ from '../../node_modules/jquery/dist/jquery.min.js'
let url = api.serviceBaseUrl + 'appdata/' + api.appID + '/'

function getHeaders() {
  return {'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')}
}
const KinveyRequester = (function () {
  function create(collection, value) {
    let tags = []
    let text = value.split(' ')
    text.forEach(word => {
      if (word[0] == '#') {
        tags.push(word)
      }
    })
    
    let post = {
      content:value,
      tags: tags,
      author: sessionStorage.getItem('username'),
      likes: 0,
      isLiked: 'admin, ',
      avatarUrl: sessionStorage.getItem('url')
    }
    
    return $.ajax({
      method: 'POST',
      url: url + collection,
      headers: getHeaders(),
      data: post
    })
  }
  function tagOperations(tag,options){
    //TODO
    //+ options.byId? + options.qStr + '{'+ options.byId + '}' : ''
    return $.ajax({
      method: options.method,
      url: url + 'tags' ,
      headers: getHeaders(),
    })
  }
  function addTags(e,value) {
    let body = {
      postId: value.postId,
      _id: value.tag
    }
    return $.ajax({
      method: 'POST',
      url: url + 'tags',
      headers: getHeaders(),
      data: body
    })
  }
  function createComment(e, value) {
    
    let post = {
      commentText: value.text,
      postId: value.postId,
      author: sessionStorage.getItem('username'),
      avatarUrl: sessionStorage.getItem('url')
    }
    return $.ajax({
      method: 'POST',
      url: url + 'comments',
      headers: getHeaders(),
      data: post
    })
  }
  
  function retrieve(collection, options) {
    return $.ajax({
      method: 'GET',
      url: url + collection,
      headers: getHeaders()
    })
  }
  
  function update(collection, entityId, content) {
    
    return $.ajax({
      method: 'PUT',
      url: url + collection + '/' + entityId,
      headers: getHeaders(),
      contentType: 'application/json',
      data: JSON.stringify(content)
    })
  }
  
  function remove(collection, entityId) {
    return $.ajax({
      method: 'DELETE',
      url: url + collection + '/' + entityId,
      headers: getHeaders(),
      contentType: 'application/json'
      
    })
  }
  function getPostById(postId) {
    
    return $.ajax({
      method: 'GET',
      url: url +  'posts/' + postId,
      headers: getHeaders(),
    })
  }
  function deleteCommentsByPostId(postId) {
    
    return $.ajax({
      method: 'DELETE',
      url: url + 'comments' + '/?query=' + JSON.stringify({postId: postId}),
      headers: getHeaders(),
    })
  }
  function getCommentsByPostId(postId) {
    
    return $.ajax({
      method: 'GET',
      url: url + 'comments' + '/?query=' + JSON.stringify({postId: postId}),
      headers: getHeaders(),
    })
  }
  function getPostsSkippedByCount(lastIndex) {
  
    return $.ajax({
      method: 'GET',
      url: url + 'posts/?query={}&skip=' + lastIndex,
      headers: getHeaders()
    })
  }
  function getPostsCount(idArray) {
    let obj = {
      _id:{
        $in:[]
      }
    }
    idArray.reverse().forEach(id=>{
      obj._id.$in.push(id)
    })
    console.log(obj)
    //?query={"_id":{"$in": []}}
    return $.ajax({
      method: 'GET',
      url: url + 'posts/?query='+ JSON.stringify(obj) ,
      headers: getHeaders()
    })
  }
  function getPostsId() {
    
    //?query={}&fields=_id
    return $.ajax({
      method: 'GET',
      url: url + 'posts/?query={}&fields=_id',
      headers: getHeaders()
    })
  }
  return {
    create,
    retrieve,
    update,
    remove,
    getCommentsByPostId,
    deleteCommentsByPostId,
    createComment,
    addTags,
    tagOperations,
    getPostById,
    getPostsCount,
    getPostsSkippedByCount,
    getPostsId
  }
})()
export default KinveyRequester
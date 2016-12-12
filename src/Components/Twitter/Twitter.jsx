import React, { Component } from 'react'
import { handlers } from '../../handlers.js'
import TweetList from '../Tweet/TweetList.jsx'
import CreateTweet from '../CreateTweet/CreateTweet'
import KinveyRequester from '../../Controllers/KinveyRequester'
import update from 'immutability-helper'
import NavigationBar from '../Navigation/NavigationBar'
import { logout } from '../../Models/User/logout.js'
import { Segment } from 'semantic-ui-react'
export default class Twitter extends Component {

  constructor(props) {
    super(props)
    this.state = {
      tweets: [],
      loading: false,
      isSearching: false,
      errorState: false
    }

    this.tweetSubmitHandler = this.tweetSubmitHandler.bind(this)
    this.addLikeHandler = this.addLikeHandler.bind(this)
    this.handleEdit = this.handleEdit.bind(this)
    this.handleLogout = this.handleLogout.bind(this)
    this.search = this.search.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
    this.addComment = this.addComment.bind(this)
    this.getTweets = this.getTweets.bind(this)
    this.getMyTweets = this.getMyTweets.bind(this)
  }

  search(e) {
    e.persist()

    if (e.target.parentNode.children[0].value) {
      this.setState({
        tweets: this.state.tweets.filter(tweet => {
          return tweet.content.includes(e.target.parentNode.children[0].value)
        }),
        isSearching: true
      })
    } else {
      this.getTweets()
    }
    e.target.parentNode.children[0].value = ''
  }

  checkForNewTweets() {
    KinveyRequester.getPostsId().then((res) => {

      this.state.tweets.forEach((i) => {
        res = res.filter((e) => {
          return e._id !== i._id
        })
      })
      if (res.length > 0) {
        KinveyRequester.getPostsCount(res.forEach(tweet => tweet._id)).then((response) => {
          console.log(response)
          response.reverse().forEach(i => {
            i.newTweet = true
          })
          console.log(response)
          this.setState({
            tweets: [...response, ...this.state.tweets]
          })
        })
      }
    })
  }

  tweetSubmitHandler(item, e) {
    e.preventDefault()
    e.stopPropagation()
    e.persist()
    let content = null
    if ((e.target.name == 'content') && e.keyCode == 13 && e.target.value.trim() != '') {
      content = e.target.value
    } else if (e.target.name == 'tweetForm') {
      content = e.target[0].value.trim()
    }
    if (content) {
      this.setState({
        loading: true
      })
      KinveyRequester.create('posts', content)
        .then((data) => {

          if (e.target.name == 'content') {
            e.target.value = ''
          } else {
            e.target[0].value = ''
          }
          this.setState({
            loading: false
          })
          if (this.state.tweets || this.state.tweets.length !== 0) {
            this.setState({
              tweets: [data, ...this.state.tweets]
            })
          } else {
            this.setState({
              tweets: [data]
            })
          }
          if (data.tags) {
            // this.tagsHandler({postId: data._id,tag: data.tags[0]})
          }
          this.checkForNewTweets()
        })

        .catch((error) => {
          console.log(error)
        })
    }
  }

  tagsHandler(value) {
    // KinveyRequester.tagOperations(value.tag,{method:'GET', byId: '_id', qStr: '/?query=', })
    // .then((data,status)=> {
    //   console.log(data,status)
    // }).catch((error)=>{
    //   console.log('GetTags error: ' + error)
    // })
    //
    // KinveyRequester.addTags(null,value).then((data,status)=>{
    //   console.log(data,status)
    // }).catch((error)=>{
    //   console.log('AddTags error: ' + error)
    // })
  }

  addLikeHandler(item, e) {
    e.persist()
    let index = -1
    let id = e.target.value

    this.state.tweets.forEach((tweet, i) => {
      if (id == tweet._id) {
        index = i
      }
    })

    item.tweetStartLoading()
    KinveyRequester.getPostById(id)
      .then((res, status) => {

        if (!res.isLiked) {
          res.isLiked = 'admin, '
        }
        res.isLiked += (sessionStorage.getItem('username') + ', ')

        res.likes++
        // RETARDED KINVEY

        KinveyRequester.update('posts', id, res).then(data => {

          item.tweetStopLoading()
          this.setState({
            tweets: update(this.state.tweets, { index: { $set: this.state.tweets[index].likes++ } })

          })
          this.setState({
            tweets: update(this.state.tweets, { index: { $set: this.state.tweets[index].isLiked += (sessionStorage.getItem('username') + ', ') } })

          })
        })

      })
      .catch(err => console.log(err))
  }

  handleDelete(nodeComponent, e) {
    e.preventDefault()
    e.stopPropagation()
    e.persist()
    nodeComponent.tweetStartLoading()
    KinveyRequester.remove('posts', nodeComponent.props.id).then((response, status) => {
      nodeComponent.tweetStopLoading()
      if (status == 'success') {
        KinveyRequester.deleteCommentsByPostId(nodeComponent.props.id)
          .then((response, status) => {
            let msg = `${nodeComponent.props.id} `
            let index = -1
            let id = nodeComponent.props.id

            this.state.tweets.forEach((tweet, i) => {
              if (id == tweet._id) {
                index = i
              }
            })
            let newState = update(this.state, {
              tweets: {
                $splice: [[index, 1]]
              }
            })
            this.setState(newState)

          }).catch((error) => {
            console.dir(`${nodeComponent.props.id} ` + error)
          })
      }

      return response
    }).catch((error) => {
      console.log(error)
    })
  }

  handleEdit(item, modalNode, e) {
    e.preventDefault()
    e.stopPropagation()
    e.persist()

    if (e.target.textContent !== 'Cancel') {
      if (e.target.form[0].value !== e.target.form[0].defaultValue) {
        item.tweetStartLoading()
        KinveyRequester.getPostById(item.props.id)
          .then((res, response) => {

            let index = -1
            let id = res._id
            res.content = e.target.form[0].value
            // this.setState({
            //   tweetUpdate: true
            // })
            KinveyRequester.update('posts', id, res).then(updatePost => {
              this.state.tweets.forEach((item, i) => {
                if (item._id == id) {
                  index = i
                }
              })

              // this.state.tweets[index].content = updatePost.content
              this.setState({
                tweets: update(this.state.tweets, { index: { $set: this.state.tweets[index].content = updatePost.content } })
              })
              item.tweetStopLoading()
            })
            return response
          }).catch((error) => {
            item.tweetStopLoading()
            console.log(error)
          })

        modalNode.refs.editMode.setState({
          open: false
        })
      }
    } else {
      item.tweetStopLoading()
      modalNode.refs.editMode.setState({
        open: false
      })
    }
  }

  addComment(item, e) {
    e.preventDefault()
    e.stopPropagation()
    if (e.keyCode == 13 && e.target.value.trim() != '') {
      e.persist()
      let id = item.props.id
      item.tweetStartLoading()
      KinveyRequester.createComment(e, {
        text: e.target.value.trim(),
        postId: item.props.id
      }).then((data) => {
        let index = -1

        this.state.tweets.forEach((tweet, i) => {
          if (id == tweet._id) {
            index = i
          }
        })
        if (this.state.tweets[index].comments) {
          let newState = update(this.state, {
            tweets: {
              [index]: { comments: { $push: [data] } }
            }
          })
          this.setState(newState)
        } else {
          let newState = update(this.state, {
            tweets: {
              [index]: { comments: { $set: [data] } }
            }
          })
          this.setState(newState)
        }
        item.tweetStopLoading()
      }).catch(err => console.log(err))
      e.target.value = ''
    }
  }

  handleLogout(e) {
    logout()
  }

  render() {
    let actionNode = this.state.isSearching ? <button onClick={this.getTweets} className='ui button blue'>
      Back
                                              </button> : <CreateTweet loading={this.state.loading} onsubmit={this.tweetSubmitHandler} />

    return (

      <div>
        <NavigationBar onClick={this.handleLogout} mytweet={this.getMyTweets} search={this.search} />
        <div className='ui container centered'>
          <div className='ui segment'>
            {actionNode}
          </div>
          <Segment className='center'>
            <TweetList
              className='ui comments'
              edit={this.handleEdit}
              delete={this.handleDelete}
              onkeyup={this.addComment}
              addLike={this.addLikeHandler}
              tweets={this.state.tweets} />
          </Segment>
        </div>
      </div>
    )
  }

  getMyTweets(e) {
    let user = sessionStorage.getItem('username')

    this.setState({
      tweets: this.state.tweets.filter(tweet => {
        return tweet.author == user
      }),
      isSearching: true
    })
  }

  getTweets() {
    KinveyRequester.retrieve('posts').then((tweets, status) => {
      tweets.reverse().forEach((t) => {
        if (!t.isLiked) {
          t.isLiked = 'admin, '
        }
        t.comments = []
      })
      this.setState({
        tweets: tweets,
        isSearching: false
      })
      this.state.tweets.forEach((e) => {
        let index = -1
        this.state.tweets.forEach((tweet, i) => {
          if (tweet._id == e._id) {
            index = i
          }
        })
        this.getComments(e._id).then(r => {
          if (r.length > 0) {
            let newState = update(this.state, {
              tweets: {
                [index]: { comments: { $push: r } }
              }
            })
            return this.setState(newState)
          }
        })
      })
    }).catch((err) => console.log(err))
  }

  getComments(id) {
    return KinveyRequester.getCommentsByPostId(id)
  }

  componentDidMount() {
    this.getTweets()
  }

  componentWillReceiveProps() { }
}

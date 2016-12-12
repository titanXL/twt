import React, { Component } from 'react'
import { Dimmer, Loader, Segment, Image } from 'semantic-ui-react'
import CommentList from '../Comments/CommentList.jsx'
import EditNode from '../Tweet/EditNode.jsx'
import AddComment from '../AddComment/AddComment.jsx'

export default class Tweet extends Component {
  state = { tweetLoading: false, tweet: true }
  tweetStartLoading = () => { return this.setState({ tweetLoading: true }) }
  tweetStopLoading = () => { return this.setState({ tweetLoading: false }) }
  disassemble = () => {return this.setState({tweet: 'none'})}
  render() {
    const {tweetLoading, tweet} = this.state
    let ownerActions
    if (this.props.owner === sessionStorage.getItem('userId')) {
      ownerActions = (<div className='ui right'>
        <button
          className='ui right floated button blue'
          style={{ 'fontSize': '0.75em' }}
          onClick={this.props.delete.bind(null, this)}
          value={this.props.id}>
          Delete
        </button>
        <EditNode edit={this.props.edit.bind(null, this)}
          content={this.props.content} />

      </div>)
    }
    let newTweet = (
      <a className="ui label right" style={{backgroundColor: 'aqua', display: tweet}}>
        NewTweet
        <i className="delete icon"
        onClick={this.disassemble}></i>
        </a>
    )
    let style = {
      color: this.props.isLiked.split(', ')
        .includes(sessionStorage.getItem('username')) ? 'red' : 'grey'
    }
    let styleComment = { 'marginTop':'100px'}
    let styleImage = {'maxHeight':'120px'}
    return (

      <Segment raised={true}  >
        <Dimmer active={tweetLoading}>
          <Loader />
        </Dimmer>
        <div className="comment" id={this.props.id} style={styleComment}>
          
          
          {this.props.newTweet? newTweet : null}
          <div className="content">
            {ownerActions}

            <div className='summary'>
            <div className='ui left floated'>
            <img src={this.props.url} className='ui small circular image' style={styleImage}/>
          </div>
              <a className='user'>
                {this.props.author}
              </a>
              <div className='date'>
                {new Date(this.props.postDate).toLocaleString()}
              </div>
              <div className='date'>
                <label>tags: </label>
                {this.props.tags}
              </div>
              <div className="content">
                <h2 style={{ 'color': '#00BFFF', 'wordWrap': 'break-word' }}>{this.props.content}</h2>
              </div>
            </div>
            <div className="meta">
              <button
                className="like"
                onClick={this.props.addLike.bind(null, this)}
                value={this.props.id}
                disabled={this.props.isLiked.split(', ').includes(sessionStorage.getItem('username'))}>
                <i className='like icon' style={style}></i>
                {this.props.likes}Love it
              </button>
            </div>
            <div className="ui comments">
              <h3 className='ui dividing header'>Comments</h3>
              <AddComment onkeyup={this.props.onkeyup.bind(null, this)} />
              <CommentList comments={this.props.comments} />
            </div>
          </div>
        </div>
      </Segment>

    )
  }
  componentDidUpdate() {

  }

}

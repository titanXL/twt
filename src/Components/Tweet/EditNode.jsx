import  React, {Component} from 'react'
import {Button, Confirm, Form, TextArea, Header, Image, Modal} from 'semantic-ui-react'
class EditNode extends Component {
  
  state = {open: false, tweetText: this.props.content}
  
  render() {
    const {open,tweetText} = this.state
    return (
      <Modal
        ref='editMode'
        trigger={<Button
          className='ui right floated button blue'
          style={{'fontSize': '0.75em'}}
        >
          Edit
        </Button>}
        >
        <Modal.Content image>
          <Image wrapped size='small' src={sessionStorage.getItem('url')}/>
        </Modal.Content>
        <Modal.Content>
          <Modal.Description>
            <Header>Tweet edit</Header>
            <Form >
              <TextArea name='content'  defaultValue={this.props.content}>
              </TextArea>
              <Button onClick={this.props.edit.bind(null, this)} name="confirm">Confirm</Button>
              <Button onClick={this.props.edit.bind(null, this)} name="cancel">Cancel</Button>
            </Form>
          </Modal.Description>
        </Modal.Content>
      </Modal>
    )
  }
}
export default EditNode
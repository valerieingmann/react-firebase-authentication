import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { AuthUserContext } from '../Session';
import { withAuthorization } from '../Session';
import * as ROLES from '../../constants/roles';
import { withFirebase } from '../Firebase';

class AddStudentBase extends Component {
  constructor(props) {
    super(props);
    this.state = {
      studentId: '',
      error: null,
      chats: [],
      chat: {},
    };
  }

  componentDidMount() {
    this.props.firebase.chats().on('value', snapshot => {
      const chatsObject = snapshot.val();
      if (chatsObject) {
        const chatsList = Object.keys(chatsObject).map(key => ({
          ...chatsObject[key],
          uid: key,
        }));

        let myChat = chatsList.filter(
          chat => chat.ownerId === this.props.authUser.uid,
        );

        this.setState({
          chats: chatsList,
          chat: myChat[0],
        });
      }
    });
  }

  componentWillUnmount() {
    this.props.firebase.chats().off();
  }

  onSubmit = event => {
    this.props.firebase.user(this.state.studentId).update({
      chatId: this.state.chat.uid,
      classroomName: this.props.authUser.classroomName,
    });
    event.preventDefault();
  };

  onChange = event => {
    this.setState({ studentId: event.target.value });
  };

  render() {
    return (
      <form onSubmit={this.onSubmit}>
        <input
          name="studentId"
          value={this.state.studentId}
          onChange={this.onChange}
          type="text"
          placeholder="Student ID"
        />

        <button type="submit">Add Student to My Room</button>
      </form>
    );
  }
}

const AddStudent = compose(
  withRouter,
  withFirebase,
)(AddStudentBase);

class AdminPage extends Component {
  constructor() {
    super();
    this.state = {
      title: '',
    };
  }

  render() {
    return (
      <AuthUserContext.Consumer>
        {authUser => (
          <div>
            <h1>Admin</h1>
            <p>
              The Admin Page is accessible by every signed in admin
              user.
            </p>
            {/* <button
              onClick={event => this.createChat(event, authUser)}
            >
              Create Chat
            </button> */}
            {/* <form
              onSubmit={event => this.createChat(event, authUser)}
            >
              <input
                type="text"
                value={this.state.title}
                onChange={this.onChange}
              />
              <button type="submit">Create New Chat Room</button>
            </form> */}

            <AddStudent authUser={authUser} />

            {/* <Switch>
              <Route
                exact
                path={ROUTES.ADMIN_DETAILS}
                component={UserItem}
              />
              <Route exact path={ROUTES.ADMIN} component={UserList} />
            </Switch> */}
          </div>
        )}
      </AuthUserContext.Consumer>
    );
  }
}

const condition = authUser =>
  authUser && !!authUser.roles[ROLES.ADMIN];

export default compose(
  withAuthorization(condition),
  withFirebase,
)(AdminPage);

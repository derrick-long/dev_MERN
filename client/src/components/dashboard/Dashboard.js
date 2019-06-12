import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Proptypes from 'prop-types';
import  { connect } from 'react-redux';
import { getCurrentProfile } from '../../actions/profileActions';

class Dashboard extends Component {
    componentDidMount(){
        this.props.getCurrentProfile();
    }

    render() {

        const { user } = this.props.auth;
        const { profile, loading } = this.props.profile;

        let dashboardContent; 

        if(profile === null || loading) {
            dashboardContent = <h4> Loading...</h4>
        } else {
           if(Object.keys(profile).length > 0){
            dashboardContent = <h4> DISPLAY PROFILE</h4>
           } else {
            dashboardContent = (
                <div>
                    <p className="lead text-muted"> Welcome {user.name}</p>
                    <p> You haven't set up a profile, please add one!</p>
                    <Link to="/create-profile" className="btn btn-lg btn-info">
                        Create Profile
                    </Link>
                </div>
            )
           }
        }

        return (
            <div className="dashboard">
                <div className="container">
                    <div className="row">
                        <div className="col-md-12">
                            <h1 className="display-4">Dashboard</h1>
                            {dashboardContent}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => ({
    profile: state.profile,
    auth: state.auth 
});

Dashboard.propTypes = {
    getCurrentProfile: Proptypes.func.isRequired,
    auth: Proptypes.object.isRequired,
    profile: Proptypes.object.isRequired
}
export default  connect(mapStateToProps, { getCurrentProfile })(Dashboard);

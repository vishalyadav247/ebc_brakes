import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthentication } from '@app/store/reducers/auth';
import { GoogleProvider } from '@app/utils/oidc-providers';

const UserDropdown = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const authentication = useSelector((state: any) => state.auth.authentication);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const logOut = async (event: any) => {
    event.preventDefault();
    setDropdownOpen(false);
    console.log('authentication', authentication);
    if (authentication.profile.first_name) {
      await GoogleProvider.signoutPopup();
    } else {

    }
    dispatch(setAuthentication(undefined));
    localStorage.removeItem('authentication');
    navigate('/login');
  };

  return (
    <div>
      <button className="btn btn-outline-primary" type="button" onClick={logOut}>
       Logout
      </button>
    </div>
  );
};

export default UserDropdown;

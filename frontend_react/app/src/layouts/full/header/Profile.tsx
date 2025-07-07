
import { Button, Dropdown } from "flowbite-react";
import molkaprofile from "/src/assets/images/profile/molkaprofile.jpg";
import { Link } from "react-router";

const Profile = () => {
  return (
    <div className="relative group/menu">
      <Dropdown
        label=""
        className="rounded-sm w-44"
        dismissOnClick={false}
        renderTrigger={() => (
          <span className="h-10 w-10 hover:text-primary hover:bg-lightprimary rounded-full flex justify-center items-center cursor-pointer group-hover/menu:bg-lightprimary group-hover/menu:text-primary">
            <img
              src={molkaprofile}
              alt="logo"
              height="35"
              width="35"
              className="rounded-full"
            />
          </span>
        )}
      >

       
        <div className="p-3 pt-0">
        <Button as={Link}  size={'sm'}  to="/auth/login" className="mt-2 border border-primary text-primary bg-transparent hover:bg-lightprimary outline-none focus:outline-none">Logout</Button>
        </div>
      </Dropdown>
    </div>
  );
};

export default Profile;

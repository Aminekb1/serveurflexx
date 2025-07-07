
import LogoIcon from '/src/assets/images/logos/Ooredoo_logo (1).svg'
import { Link } from 'react-router';

const Logo = () => {
  return (
   <Link to={'/'}>
      <img src={LogoIcon} alt="logo" />
    </Link>
  )
}

export default Logo

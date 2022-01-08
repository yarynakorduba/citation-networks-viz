import { Link } from 'react-router-dom';

function NavCard(props) {
  return (
    <Link to={props.to}>
      <div className="card">
        <div className="card-img" style={{ backgroundImage: `url(${props.bannerImage})` }} />
        <div className="card-body">
          <div className="card-title">{props.title}</div>
          <div className="card-subtitle">{props.subtitle}</div>
        </div>
      </div>
    </Link>
  );
}

export default NavCard;

import userImge from "../../assets/images/userimg.webp";

const UserAvatarImgComponent = (props) => {
  return (
    <div className={`userImg ${props.lg == true && "lg"}`}>
      <span className="rounded-circle">
        <img src={props.img} alt="not found" />
      </span>
    </div>
  );
};
export default UserAvatarImgComponent;

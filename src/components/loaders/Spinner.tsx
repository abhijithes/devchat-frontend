import "./spinner.css";

const Spinner = ({style = "w-6 h-6"}) => {
  return <div className={`spinner ${style}`}></div>;
};

export default Spinner;

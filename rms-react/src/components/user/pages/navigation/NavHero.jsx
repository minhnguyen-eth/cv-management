import React from "react";
import Search from "../../header/Search";

const NavHero = ({ hero, job }) => {
  const titleMap = {
    jobs: "Tìm việc làm",
    search: "Tìm việc làm",
    contact: "Liên hệ",
    Login: "Đăng nhập",
    "Sign Up": "Đăng ký",
    "Forgot Password": "Quên mật khẩu",
  };

  const heroTitle = titleMap[hero] || hero;

  return (
    <div className="hero_section">
      <>
        {hero === "jobs" || hero === "search" ? (
          <>
            <div className="title">
              <h1>{heroTitle}</h1>
            </div>
            <div className="search_nav">
              <Search />
            </div>
          </>
        ) : hero === "contact" ||
          hero === "Login" ||
          hero === "Sign Up" ||
          hero === "Forgot Password" ? (
          <h1 className="title">{heroTitle}</h1>
        ) : (
          job && (
            <>
              <div className="hero-data">
                <div className="left">
                  <div className="icon">
                    <img src={job.icon} alt="icon" />
                  </div>
                  <div className="details">
                    <h1>{job.title}</h1>
                    <div className="posted">
                      <div className="country">
                        <i className="fa fa-map-marker"></i>
                        <span>{job.company}</span>
                      </div>
                      <div className="date">
                        <i className="fa fa-calendar"></i>
                        <span>Đăng vào 2 Thg 2, 2022</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="right">
                  <div className="amount">
                    <h2>Lương hàng tháng</h2>
                    <h2>{job.salary} TK</h2>
                  </div>
                </div>
              </div>
            </>
          )
        )}
      </>
    </div>
  );
};

export default NavHero;

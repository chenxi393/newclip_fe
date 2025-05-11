import { Link, Outlet } from "react-router-dom";
import styles from "../assets/styles/Header.module.scss";
import { FiUpload } from "react-icons/fi";
import { Modal, Form, Input, Button, message, Popover } from "antd";
import { useEffect, useState } from "react";
import { BiShare, BiSearchAlt2 } from "react-icons/bi";
import { AiOutlineHeart, AiOutlineMessage, AiOutlineMore } from "react-icons/ai";
import { OpenAIFilled } from '@ant-design/icons';
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux/es/hooks/useSelector";
import { login, register } from "../utils/loginRegister";
import { useNavigate } from "react-router-dom";
import getPersonalInfo from "../utils/getPersonalInfo";
import PersonalPopover from "./PersonalPopover";
import MessagePopover from "./MessagePopover";
import {
  loginFailure,
  loginRequest,
  loginSuccess,
  registerFailure,
  registerRequest,
  registerSuccess,
} from "../redux/actions/loginRegisterAction";
import { getFriendList } from "../utils/getMessage";
import UploadPopover from "./UploadPopover";
import {
  hideLogin,
  hideMessages,
  hidePersonal,
  hideUpload,
  showLogin,
  showMessages,
  showPersonal,
  showUpload,
} from "../redux/actions/popoverAction";
import { changeInfo } from "../redux/actions/personalAction";
import { changeChooseClass } from "../redux/actions/videosAction";
import { changeFriendList } from "../redux/actions/personalAction";
import AiChatPopover from "./AiChatPopover";
function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [search, setSearch] = useState(""); //搜索框的值
  const [choose, setChoose] = useState([true, false]); //登录注册选择
  const id = useSelector((state) => state?.loginRegister?.user_id);
  const token = useSelector((state) => state?.loginRegister?.token);
  const info = useSelector((state) => state?.personal?.info);
  const logout = useSelector((state) => state?.loginRegister?.logout);
  const loginWaiting = useSelector((state) => state?.loginRegister?.loginWaiting);
  const registerWaiting = useSelector((state) => state?.loginRegister?.registerWaiting);
  const isShowLogin = useSelector((state) => state?.popover?.isShowLogin);
  const isShowMessage = useSelector((state) => state?.popover?.isShowMessage);
  const isShowUpload = useSelector((state) => state?.popover?.isShowUpload);
  const isShowPersonal = useSelector((state) => state?.popover?.isShowPersonal);
  const chooseClass = useSelector((state) => state?.videos?.chooseClass);
  useEffect(() => {
    if (logout || !id || !token) return;
    getPersonalInfo(id, token)
      .then((res) => dispatch(changeInfo(res.user)))
    getFriendList(id, token)
      .then((res) => dispatch(changeFriendList(res.user_list)));
  }, [id, token, isShowPersonal, isShowMessage, logout, dispatch]);

  function onFinishLogin(values) {
    dispatch(loginRequest());
    message.loading("登录中...", 0);
    login(values.username, values.password)
      .then((res) => {
        message.destroy();
        dispatch(loginSuccess(values.username, res.token, res.status_msg, res.user_id));
        dispatch(hideLogin());
      })
  }

  function onFinishRegister(values) {
    dispatch(registerRequest());
    message.loading("注册中...", 0);
    register(values.username, values.password)
      .then((res) => {
        message.destroy();
        message.success(res.status_msg);
        dispatch(registerSuccess(res.status_msg));
      })
  }
  function onFinishFailed(errorInfo) {
    console.log("Failed:", errorInfo);
  }
  function handleSearch() {
    if (search !== "") {
      if (search.length < 2) {
        message.warning("请至少输入两个字！");
        return;
      }
      navigate("/search?keyword=" + search);
      setSearch("");
    }
  }
  function handleKeydown(e) {
    if (e.key === "Enter") {
      handleSearch();
    }
  }
  function handleFileChange() {
    if (logout) {
      message.error("请先登录");
      dispatch(showLogin());
    } else isShowUpload ? dispatch(hideUpload()) : dispatch(showUpload()); //控制开启关闭上传popover
  }
  function handleMessage() {
    if (logout) {
      message.error("请先登录");
      dispatch(showLogin());
    } else isShowMessage ? dispatch(hideMessages()) : dispatch(showMessages());
  }
  function handlePersonal() {
    !isShowPersonal ? dispatch(showPersonal()) : dispatch(hidePersonal()); //控制开启关闭个人信息popover
  }
  return (
    <header className={styles.app}>
      <div className={styles.headerContainer}>
        <div className={styles.header}>
          <div className={styles.brand}>
            <Link className={styles.link} to="https://github.com/qiankun521/NewClip">
              NewClip
            </Link>
          </div>
          <nav className={styles.navlinks}>
            <Link
              className={`${styles.link} ${chooseClass === 1 && styles.choose}`}
              to="/"
              onClick={() => dispatch(changeChooseClass(1))}>
              首页
            </Link>
            <Link
              className={`${styles.link} ${chooseClass === 2 && styles.choose}`}
              to="/"
              onClick={() => dispatch(changeChooseClass(2))}>
              体育
            </Link>
            <Link
              className={`${styles.link} ${chooseClass === 3 && styles.choose}`}
              to="/"
              onClick={() => dispatch(changeChooseClass(3))}>
              游戏
            </Link>
            <Link
              className={`${styles.link} ${chooseClass === 4 && styles.choose}`}
              to="/"
              onClick={() => dispatch(changeChooseClass(4))}>
              音乐
            </Link>
          </nav>
          <div className={styles.searchInput}>
            <input
              type="text"
              placeholder="请输入搜索关键词"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeydown}
            />
            <div className={styles.searchIcon} onClick={handleSearch}>
              <BiSearchAlt2></BiSearchAlt2>
            </div>
          </div>
          <div className={styles.personalbar}>
            <div className={styles.more}>
              <Popover
                trigger="click"
                content={<AiChatPopover></AiChatPopover>}>
                <OpenAIFilled />
              </Popover>
              {/* <div className={styles.moreText}>AI助手</div> */}
            </div>
            <Popover
              open={isShowUpload}
              onClick={handleFileChange}
              destroyTooltipOnHide={true}
              content={<UploadPopover></UploadPopover>}>
              <div className={styles.upload}>
                <div>
                  <FiUpload></FiUpload>
                </div>
                <div className={styles.uploadText}>上传</div>
              </div>
            </Popover>
            <Popover
              destroyTooltipOnHide
              open={isShowMessage}
              onClick={handleMessage}
              content={<MessagePopover handleMessage={handleMessage}></MessagePopover>}>
              <div className={styles.message}>
                <div>
                  <AiOutlineMessage></AiOutlineMessage>
                </div>
                <div className={styles.messageText}>私信</div>
              </div>
            </Popover>
          </div>
          <div className={styles.person}>
            {logout ? (
              <div className={styles.personal}>
                <div className={styles.login} onClick={() => dispatch(showLogin())}>
                  登录
                </div>
              </div>
            ) : (
              info && (
                <Popover
                  content={<PersonalPopover info={info} />}
                  placement="bottomRight"
                  trigger={["hover", "click"]}
                  open={isShowPersonal}
                  onOpenChange={handlePersonal}>
                  <div
                    className={styles.avatar}
                    style={{
                      backgroundImage: `url(${info.avatar})`,
                      backgroundSize: "cover",
                    }}
                    onClick={() => {
                      navigate("/personal");
                      dispatch(hidePersonal());
                    }}></div>
                </Popover>
              )
            )}
          </div>
        </div>
      </div>
      <Modal
        open={isShowLogin}
        onCancel={() => dispatch(hideLogin())}
        footer={null}
        className={styles.modal}>
        <div className={styles.modalContainer}>
          <div className={styles.modalTitle}>登录后畅享更多精彩</div>
          <div className={styles.titleGroup}>
            <div className={styles.modalTitleSmall}>
              <div className={styles.icon}>
                <BiShare />
              </div>
              一键分享视频给好友
            </div>
            <div className={styles.modalTitleSmall}>
              <div className={styles.icon}>
                <AiOutlineHeart />
              </div>
              点赞评论随心发
            </div>
          </div>
          <div className={styles.choose}>
            <div
              className={`${styles.chooseItem} ${choose[0] && styles.choosed}`}
              onClick={() => setChoose([true, false])}>
              登录
            </div>
            <div
              className={`${styles.chooseItem} ${choose[1] && styles.choosed}`}
              onClick={() => setChoose([false, true])}>
              注册
            </div>
          </div>
          {choose[0] && (
            <Form
              name="complex-form"
              onFinish={onFinishLogin}
              onFinishFailed={onFinishFailed}
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 10 }}>
              <Form.Item
                label="用户名"
                name="username"
                rules={[{ required: true, message: "请输入用户名!" }]}>
                <Input className={styles.input} />
              </Form.Item>
              <Form.Item
                label="用户密码"
                name="password"
                rules={[{ required: true, message: "请输入用户密码!" }]}>
                <Input.Password className={styles.input} />
              </Form.Item>
              <Form.Item
                wrapperCol={{
                  offset: 8
                }}>
                <Button type="primary" htmlType="submit" disabled={loginWaiting}>
                  登录
                </Button>
              </Form.Item>
            </Form>
          )}
          {choose[1] && (
            <Form
              name="complex-form"
              onFinish={onFinishRegister}
              onFinishFailed={onFinishFailed}
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 10 }}>
              <Form.Item
                label="用户名"
                name="username"
                rules={[
                  {
                    required: true,
                    message: "请输入用户名!",
                  },
                  {
                    max: 32,
                    message: "用户名长度不能超过32位",
                  },
                ]}>
                <Input />
              </Form.Item>
              <Form.Item
                label="用户密码"
                name="password"
                rules={[
                  {
                    required: true,
                    message: "请输入用户密码!",
                  },
                  {
                    min: 6,
                    message: "密码长度不能小于6位",
                  },
                ]}>
                <Input.Password />
              </Form.Item>

              <Form.Item
                wrapperCol={{
                  offset: 8,
                }}>
                <Button htmlType="submit" disabled={registerWaiting}>
                  注册
                </Button>
              </Form.Item>
            </Form>
          )}
        </div>
      </Modal>
      <Outlet></Outlet>
    </header>
  );
}

export default Header;

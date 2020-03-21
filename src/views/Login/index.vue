<template>
  <div id="login">
    <div class="login-wrap">
      <ul class="menu-tab">
        <li
          :class="{ current: item.current }"
          v-for="item in menuTab"
          :key="item.id"
          @click="toggleMenu(item)"
        >
          {{ item.txt }}{{ item.id }}
        </li>
      </ul>
      <!-- 表单 start -->
      <el-form
        :model="ruleForm"
        status-icon
        :rules="rules"
        ref="loginForm"
        class="login-form"
        size="medium"
      >
        <el-form-item prop="username" class="item-form">
          <label>邮箱</label>
          <el-input type="text" v-model="ruleForm.username" autocomplete="off">
          </el-input>
        </el-form-item>
        <el-form-item prop="password" class="item-form">
          <label>密码</label>
          <el-input
            type="password"
            v-model="ruleForm.password"
            autocomplete="off"
            minlength="6"
            maxlength="20"
          >
          </el-input>
        </el-form-item>
        <el-form-item
          prop="passwords"
          class="item-form"
          v-if="model === 'register'"
        >
          <label>重复密码</label>
          <el-input
            type="password"
            v-model="ruleForm.passwords"
            autocomplete="off"
            minlength="6"
            maxlength="20"
          >
          </el-input>
        </el-form-item>
        <el-form-item prop="code" class="item-form">
          <label>验证码</label>
          <el-row :gutter="11">
            <el-col :span="15">
              <el-input v-model="ruleForm.code" minlength="6" maxlength="6">
              </el-input>
            </el-col>
            <el-col :span="9">
              <el-button
                :disabled="codeButtonStatus.status"
                type="success"
                class="block"
                @click="getSms()"
                >{{ codeButtonStatus.text }}</el-button
              >
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item>
          <el-button
            :disabled="loginButtomStatus"
            type="danger"
            @click="submitForm('loginForm')"
            class="login-btn block"
          >
            {{ model === "login" ? "登录" : "注册" }}</el-button
          >
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
// 加密（sha1，base64，md5）
import sha1 from "js-sha1";
// 引入接口
import { GetSms, Register, Login } from "@/api/login";
// 引入vue方法
import { reactive, ref, onMounted } from "@vue/composition-api";
// 引入正则验证
import {
  stripscript,
  validateEmail,
  validatePass,
  validateAcode
} from "@/utils/validate";

export default {
  name: "login",
  // setup(props, context){
  setup(props, { refs, root }) {
    // 验证函数声明（首先验证）
    // 验证用户名
    let validateUsername = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入用户名"));
      } else if (validateEmail(value)) {
        callback(new Error("用户名格式错误"));
      } else {
        callback();
      }
    };
    // 验证密码
    let validatePassword = (rule, value, callback) => {
      ruleForm.password = stripscript(value);
      value = ruleForm.password;
      if (value === "") {
        callback(new Error("请输入密码"));
      } else if (validatePass(value)) {
        callback(new Error("密码为6至20位数字+字母"));
      } else {
        callback();
      }
    };
    // 验证重复密码
    let validatePasswords = (rule, value, callback) => {
      // 在用v-show的情况下，登录页面要验证，判断登录=login就不需要验证。
      // if(model.value === 'login') { callback(); }
      ruleForm.passwords = stripscript(value);
      value = ruleForm.passwords;
      if (value === "") {
        callback(new Error("请再次输入密码"));
      } else if (value != ruleForm.password) {
        callback(new Error("重复密码不正确"));
      } else {
        callback();
      }
    };
    // 验证验证码
    let validateCode = (rule, value, callback) => {
      if (value === "") {
        return callback(new Error("请输入验证码"));
      } else if (validateAcode(value)) {
        return callback(new Error("验证码输入有误"));
      } else {
        callback();
      }
    };
    /**
     * 声明数据
     */
    // data数据、生命周期、自定义的函数
    const menuTab = reactive([
      { txt: "登录", current: true, type: "login" },
      { txt: "注册", current: false, type: "register" }
    ]);
    // 模块值
    const model = ref("login");
    // 登录按钮禁用状态
    const loginButtomStatus = ref(true);
    const codeButtonStatus = reactive({
      // 验证码按钮状态
      status: false,
      // 登录获取验证码
      text: "获取验证码"
    });
    // 倒计时
    const timer = ref(null);
    // 表单绑定数据
    const ruleForm = reactive({
      username: "",
      password: "",
      passwords: "",
      code: ""
    });
    // 表单的验证
    const rules = reactive({
      username: [{ validator: validateUsername, trigger: "blur" }],
      password: [{ validator: validatePassword, trigger: "blur" }],
      passwords: [{ validator: validatePasswords, trigger: "blur" }],
      code: [{ validator: validateCode, trigger: "blur" }]
    });
    /**
     * 声明函数
     */
    // 循环点击登录注册
    const toggleMenu = item => {
      menuTab.forEach(elem => {
        elem.current = false;
      });
      // 高光
      item.current = true;
      // 修改模块值
      model.value = item.type;
      resetFromData();
      clearCountDown();
    };
    // 清除表单数据
    const resetFromData = () => {
      refs.loginForm.resetFields();
    };
    // 更新按钮状态
    const updataButtonStatus = params => {
      codeButtonStatus.status = params.status;
      codeButtonStatus.text = params.text;
    };
    /**
     * 获取验证码
     */
    const getSms = () => {
      // 判断邮箱为空
      if (ruleForm.username == "") {
        root.$message.error("请输入您的邮箱！！");
        return false;
        // 判断邮箱格式有误
      }
      if (validateEmail(ruleForm.username)) {
        root.$message.error("邮箱格式有误，请重新输入");
        return false;
      }
      // 获取验证码
      let requestData = {
        username: ruleForm.username,
        // 判断登录注册验证码
        module: model.value
      };
      // 修改获取验证按钮状态
      updataButtonStatus({
        status: true,
        text: "发送中..."
      });
      // 请求的接口
      GetSms(requestData)
        .then(response => {
          let data = response.data;
          root.$message({
            message: data.message,
            type: "success"
          });
          loginButtomStatus.value = false;
          countDown(4);
        })
        .catch(error => {
          console.log(error);
        });
    };
    /**
     * 提交表单
     */
    const submitForm = formName => {
      refs[formName].validate(valid => {
        // 表单验证通过
        if (valid) {
          model.value === "login" ? login() : register();
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    };
    /**
     * 登录
     */
    const login = () => {
      let requestData = {
        username: ruleForm.username,
        password: sha1(ruleForm.password),
        code: ruleForm.code,
        module: "login"
      };
      Login(requestData)
        .then(response => {
          let data = response.data;
          console.log(data);
        })
        .catch(error => {
          console.log(error);
        });
    };
    /**
     * 注册
     */
    const register = () => {
      let requestData = {
        username: ruleForm.username,
        password: sha1(ruleForm.password),
        code: ruleForm.code,
        module: "register"
      };
      // 注册接口
      Register(requestData)
        .then(response => {
          let data = response.data;
          root.$message({
            message: data.message,
            type: "success"
          });
          // 模拟注册成功
          toggleMenu(menuTab[0]);
          clearCountDown();
        })
        .catch(error => {
          // 失败执行的代码
          console.log(error);
        });
    };
    /**
     * 定时器（倒计时）
     */
    const countDown = number => {
      // 清空定时器
      if (timer.value) {
        clearInterval(timer.value);
      }
      // 执行定时器
      let time = number;
      timer.value = setInterval(() => {
        time--;
        if (time === 0) {
          clearInterval(timer.value);
          updataButtonStatus({
            status: false,
            text: "再次获取"
          });
        } else {
          codeButtonStatus.text = `倒计时${time}秒`;
        }
      }, 1000);
    };
    /**
     * 清除倒计时
     */
    const clearCountDown = () => {
      updataButtonStatus({
        status: false,
        text: "获取验证码"
      });
      clearInterval(timer.value);
    };
    /**
     * 生命周期
     */
    // 挂载完成后
    onMounted(() => {});

    return {
      menuTab,
      model,
      loginButtomStatus,
      codeButtonStatus,
      ruleForm,
      rules,
      timer,
      toggleMenu,
      submitForm,
      getSms
    };
  }
};
</script>

<style lang="scss" scoped>
#login {
  height: 100vh;
  background-color: #344a5f;
}
.login-wrap {
  width: 330px;
  margin: auto;
}
.menu-tab {
  text-align: center;
  li {
    display: inline-block;
    width: 88px;
    line-height: 36px;
    font-size: 14px;
    color: #fff;
    border-radius: 2px;
    cursor: pointer;
  }
  .current {
    background-color: rgba($color: #000, $alpha: 0.1);
  }
}
.login-form {
  margin-top: 29px;
  label {
    display: block;
    margin-bottom: 3px;
    font-size: 14px;
    color: #fff;
  }
  .item-form {
    margin-bottom: 13px;
  }
  .block {
    display: block;
    width: 100%;
  }
  .login-btn {
    margin-top: 19px;
  }
}
</style>

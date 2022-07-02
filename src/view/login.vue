<template>
  <div id="login">
    <el-form
      ref="loginForm"
      :model="form"
      :rules="loginRules"
      label-width="50px"
      class="login-box"
      v-loading="loading"
      element-loading-text="登录中"
    >
      <img :src="logo" class="sidebar-logo" />

      <h3 class="login-title">Vue_Cesium</h3>
      <el-form-item label="账号" prop="username">
        <el-input
          type="text"
          placeholder="请输入账号"
          v-model="form.username"
        />
      </el-form-item>

      <el-form-item label="密码" prop="password">
        <el-input
          ref="password"
          :type="passwordType"
          placeholder="请输入密码"
          v-model="form.password"
        />
        <span class="show-pwd" @click="showPwd">
          <svg-icon
            :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'"
          />
        </span>
      </el-form-item>

      <el-form-item>
        <el-button
          class="login-button"
          type="primary"
          v-on:click="onSubmit('loginForm')"
          >登录</el-button
        >
      </el-form-item>
    </el-form>

    <el-dialog title="温馨提示" :visible.sync="dialogVisible" width="30%">
      <span>请输入账号和密码</span>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogVisible = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script scoped>
import logo1 from "@/icons/svg/icon2.png";
import { validUsername } from "@/utils/validate";

export default {
  name: "Login",
  data: {
    isShow: true,
  },
  data() {
    const validateUsername = (rule, value, callback) => {
      if (!validUsername(value)) {
        callback(new Error("请输入正确的用户名"));
      } else {
        callback();
      }
    };
    const validatePassword = (rule, value, callback) => {
      if (value.length < 6) {
        callback(new Error("密码不能少于6位"));
      } else {
        callback();
      }
    };

    return {
      form: {
        username: "yangfan",
        password: "123123",
      },

      // 表单验证，需要在 el-form-item 元素中增加 prop 属性
      loginRules: {
        username: [
          { required: true, trigger: "blur", validator: validateUsername },
        ],
        password: [
          { required: true, trigger: "blur", validator: validatePassword },
        ],
      },

      // 对话框显示和隐藏
      dialogVisible: false,
      // 加载动画
      loading: false,
      // Logo
      logo: logo1,
      // 密码类型
      passwordType: "password",
    };
  },
  watch: {
    $route: {
      handler: function (route) {
        this.redirect = route.query && route.query.redirect;
      },
      immediate: true,
    },
  },
  methods: {
    showPwd() {
      console.log("点击密码显示隐藏" + this.passwordType);
      if (this.passwordType === "password") {
        this.passwordType = "";
      } else {
        this.passwordType = "password";
      }
      // 聚焦密码
      this.$nextTick(() => {
        this.$refs.password.focus();
      });
    },
    onSubmit(formName) {
      // 为表单绑定验证功能
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.loading = true;
          // 测试时睡一秒再执行
          setTimeout(() => {
            this.$router.push({
              path: this.redirect || "/viewer",
            });
            // 直接替换路由，不用push，不让用户返回，正式改成这个
            //this.$router.replace("/hello");
            //this.loading = false;
          }, 1000);
          // 使用 vue-router 路由到指定页面，该方式称之为编程式导航
        } else {
          console.log("校验不通过");
          return false;
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
$bg: #2d3a4b;
$black: #000000; //图标颜色
$light_gray: #eee;

#login {
  position: absolute;
  background-image: url("../../static/earth.jpg");
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-attachment: fixed;
  width: 100%;
  height: 100vh;
}
.login-box {
  border: 1px solid #dcdfe6;
  width: 315px;
  margin: 100px auto;
  padding: 35px 50px 15px 40px;
  border-radius: 20px;
  -webkit-border-radius: 10px;
  // -moz-border-radius: 50px;
  box-shadow: 0 0 20px #909399;
  background-color: #fff;
  opacity: 0.92;
}

.login-title {
  text-align: center;
  margin: 0 auto 40px auto;
  color: #303133;
}

.login-button {
  width: 100%;
  margin: 15px auto 0px auto;
  background-color: #5582f3;
}

.sidebar-logo-link {
  height: 100%;
  width: 100%;
}

.show-pwd {
  position: absolute;
  right: 10px;
  top: 7px;
  font-size: 16px;
  color: $black;
  cursor: pointer;
  user-select: none;
}
</style>

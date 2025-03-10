const fs = require("fs");
const path = require("path");
const axios = require("axios");
const colors = require("colors");
const readline = require("readline");
const { DateTime } = require("luxon");
const { HttpsProxyAgent } = require("https-proxy-agent");
const user_agents = require("./config/userAgents");
const settings = require("./config/config");
const { sleep, loadData, getRandomNumber, isTokenExpired, saveToken } = require("./utils");
const { Worker, isMainThread, parentPort, workerData } = require("worker_threads");
const { checkBaseUrl } = require("./checkAPI");

class Boink {
  constructor(queryId, accountIndex, proxy, baseURL, tokens) {
    this.headers = {
      Accept: "application/json, text/plain, */*",
      "Accept-Encoding": "gzip, deflate, br",
      "Accept-Language": "vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5",
      "Content-Type": "application/json",
      Origin: "https://boink.boinkers.co",
      Referer: "https://boink.boinkers.co/",
      "Sec-Ch-Ua": '"Not/A)Brand";v="99", "Google Chrome";v="115", "Chromium";v="115"',
      "Sec-Ch-Ua-Mobile": "?0",
      "Sec-Ch-Ua-Platform": '"Windows"',
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-origin",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
      Cookie:
        "cboink.production.sid=s%3AdW4oO4-ZV4lfgCgC6CoyJV3ZwUWpvEIQ.vo6IaR00WYVlINdo7KofNspXnS5gVwQTgRgJm4BLD7w; _ga=GA1.1.316220204.1741159032; cf_clearance=L3ICbRgcqnUHg7BHJ20qyNioj1FriMsg3ca9JrQd.j8-1741159034-1.2.1.1-eRrx1yH4NekFdqFXA.6O44_5QmmZStt_yPhTcAKLnKIjB0Pg4HdnwnjKewXLoGqp_pQVdQUpZCOFwUV4Il6YvCpRdXCtlg7feso3VUiw2Xjb8OY4dTuB8WfAqoJJTqE2GGUiIK.ZMBmEtT3C8ErD3_NICzUmfrMzgl47krEzsOrsybpuabSXU.OgiuMU.12TDUfwKZr_b8hzZRXthtkGcibC1zC.OVrHyyU.x5csMwnzKNsmRhmd.YgScBmsYpo0MX_CLJUmOG8O7ucAPuYl2BScJDv48bcr6etrSqSkJhNsYa3YcakvplDS24cYkkxmEGU6A1Ji9gAsZLE93dyrBWYOUPV6IDn9TjcMs0BG6Xa8hUdSt9GSci0pswc10cMT4.oTG59zwNJHC9nLYWrjo0QNkO8dldcpmeJYmZlJPsk; _fbp=fb.1.1741159033196.450173099943643160; inpu1=1; ucc1=16; _ga_QGGLFFQ8M4=GS1.1.1741159031.1.1.1741159281.0.0.0; mp_8e903983fa8144170b628a5e084a2be3_mixpanel=%7B%22distinct_id%22%3A%20%22%24device%3A195652a65c9b18-0e873eca3431bd-4c657b58-144000-195652a65c9b18%22%2C%22%24device_id%22%3A%20%22195652a65c9b18-0e873eca3431bd-4c657b58-144000-195652a65c9b18%22%2C%22%24initial_referrer%22%3A%20%22%24direct%22%2C%22%24initial_referring_domain%22%3A%20%22%24direct%22%2C%22__mps%22%3A%20%7B%7D%2C%22__mpso%22%3A%20%7B%22%24initial_referrer%22%3A%20%22%24direct%22%2C%22%24initial_referring_domain%22%3A%20%22%24direct%22%7D%2C%22__mpus%22%3A%20%7B%7D%2C%22__mpa%22%3A%20%7B%7D%2C%22__mpu%22%3A%20%7B%7D%2C%22__mpr%22%3A%20%5B%5D%2C%22__mpap%22%3A%20%5B%5D%2C%22__timers%22%3A%20%7B%22AppLoadingEnded%22%3A%201741159281810%7D%2C%22__alias%22%3A%20%2266e029cb499508f3cd5cc89e%22%2C%22%24user_id%22%3A%20%2266e029cb499508f3cd5cc89e%22%2C%22abClass%22%3A%20%22b%22%2C%22%24name%22%3A%20%22huyautomation2x%22%2C%22chatId%22%3A%205749675527%2C%22provider%22%3A%20%22telegram%22%2C%22currencySoft%22%3A%20993777%2C%22currencyCrypto%22%3A%202596191.7973676664%2C%22currentBoinkerId%22%3A%20%22Anubis%22%2C%22currentBoinkerLevel%22%3A%203%2C%22currentBoinkerLastUpdate%22%3A%20%222025-03-05T07%3A17%3A28.019Z%22%2C%22lastUpdateCompletedBoinkers%22%3A%20%222025-03-05T07%3A17%3A28.019Z%22%2C%22countOfCompletedBoinkers%22%3A%2010%2C%22lastLoginDate%22%3A%20%222025-03-05T07%3A17%3A28.498Z%22%2C%22registrationDate%22%3A%20%222024-09-10T11%3A13%3A15.621Z%22%2C%22daysSinceRegistration%22%3A%20175%2C%22slotMachineEnergy%22%3A%2010%2C%22slotMachineEnergyUsed%22%3A%20411%2C%22slotMachineBetsDone%22%3A%2076%2C%22slotMachineLastUpdated%22%3A%20%222024-10-18T04%3A41%3A24.915Z%22%2C%22wheelOfFortuneEnergy%22%3A%200%2C%22wheelOfFortuneLastUpdated%22%3A%20%222024-09-13T00%3A15%3A30.139Z%22%2C%22inviterId%22%3A%20%2266dfed5fcf59c389dfcaac27%22%2C%22isInvited%22%3A%20true%2C%22isWalletConnected%22%3A%20true%2C%22locale%22%3A%20%22en%22%2C%22platform%22%3A%20%22tdesktop%22%2C%22isTelegram%22%3A%20true%2C%22countOfPurchases%22%3A%200%2C%22lastPurchaseDate%22%3A%200%2C%22lastPurchaseValue%22%3A%200%2C%22maxPurchaseValue%22%3A%200%2C%22totalUSDValue%22%3A%200%7D",
    };
    this.baseURL = baseURL;
    this.queryId = queryId;
    this.accountIndex = accountIndex;
    this.proxy = proxy;
    this.proxyIP = null;
    this.session_name = null;
    this.session_user_agents = this.#load_session_data();
    this.skipTasks = settings.SKIP_TASKS;
    this.tokens = tokens;
    this.token = null;
  }
  #load_session_data() {
    try {
      const filePath = path.join(process.cwd(), "session_user_agents.json");
      const data = fs.readFileSync(filePath, "utf8");
      return JSON.parse(data);
    } catch (error) {
      if (error.code === "ENOENT") {
        return {};
      } else {
        throw error;
      }
    }
  }

  #get_random_user_agent() {
    const randomIndex = Math.floor(Math.random() * user_agents.length);
    return user_agents[randomIndex];
  }

  #get_user_agent() {
    if (this.session_user_agents[this.session_name]) {
      return this.session_user_agents[this.session_name];
    }

    this.log(`Tạo user agent...`);
    const newUserAgent = this.#get_random_user_agent();
    this.session_user_agents[this.session_name] = newUserAgent;
    this.#save_session_data(this.session_user_agents);
    return newUserAgent;
  }

  #save_session_data(session_user_agents) {
    const filePath = path.join(process.cwd(), "session_user_agents.json");
    fs.writeFileSync(filePath, JSON.stringify(session_user_agents, null, 2));
  }

  #get_platform(userAgent) {
    const platformPatterns = [
      { pattern: /iPhone/i, platform: "ios" },
      { pattern: /Android/i, platform: "android" },
      { pattern: /iPad/i, platform: "ios" },
    ];

    for (const { pattern, platform } of platformPatterns) {
      if (pattern.test(userAgent)) {
        return platform;
      }
    }

    return "Unknown";
  }

  set_headers() {
    const platform = this.#get_platform(this.#get_user_agent());
    this.headers["sec-ch-ua"] = `"Not)A;Brand";v="99", "${platform} WebView";v="127", "Chromium";v="127`;
    this.headers["sec-ch-ua-platform"] = platform;
    this.headers["User-Agent"] = this.#get_user_agent();
  }

  createUserAgent() {
    const telegramauth = this.queryId;
    const userData = JSON.parse(decodeURIComponent(telegramauth.split("user=")[1].split("&")[0]));
    this.session_name = userData.id;
    this.#get_user_agent();
  }
  loadProxies() {
    try {
      return fs.readFileSync("proxy.txt", "utf8").split("\n").filter(Boolean);
    } catch (error) {
      this.log("Không thể đọc file proxy.txt", "error");
      return [];
    }
  }

  getNextProxy() {
    return this.proxy;
  }

  async log(msg, type = "info") {
    const accountPrefix = `[Tài khoản ${this.accountIndex + 1}]`;
    let ipPrefix = "[Local IP]";
    if (settings.USE_PROXY) {
      ipPrefix = this.proxyIP ? `[${this.proxyIP}]` : "[Unknown IP]";
    }
    let logMessage = "";

    switch (type) {
      case "success":
        logMessage = `${accountPrefix}${ipPrefix} ${msg}`.green;
        break;
      case "error":
        logMessage = `${accountPrefix}${ipPrefix} ${msg}`.red;
        break;
      case "warning":
        logMessage = `${accountPrefix}${ipPrefix} ${msg}`.yellow;
        break;
      case "custom":
        logMessage = `${accountPrefix}${ipPrefix} ${msg}`.magenta;
        break;
      default:
        logMessage = `${accountPrefix}${ipPrefix} ${msg}`.blue;
    }
    console.log(logMessage);
  }
  async makeRequest(
    url,
    method,
    data = {},
    options = {
      retries: 0,
      isAuth: false,
    }
  ) {
    const { retries, isAuth } = options;

    const headers = {
      ...this.headers,
    };

    if (!isAuth) {
      headers["authorization"] = this.token;
    }

    let proxyAgent = null;
    if (settings.USE_PROXY) {
      proxyAgent = new HttpsProxyAgent(this.proxy);
    }
    let currRetries = 0,
      success = false;
    do {
      try {
        const response = await axios({
          method,
          url: `${url}${isAuth ? "" : "?p=unknown&v=2037265378"}`,
          data,
          headers,
          httpsAgent: proxyAgent,
          timeout: 30000,
        });
        success = true;
        if (response?.data?.data) return { success: true, data: response.data.data };
        return { success: true, data: response.data };
      } catch (error) {
        if (error.status < 500 && error.status >= 400 && error.status != 429) {
          // this.log(`Telegram channel Link: https://t.me/Bilalstudio2");
          return { success: false, status: error.status, error: error.response.data.error || error.response.data.message || error.message };
        }
        this.log(`Yêu cầu thất bại: ${url} | ${error.response.data ? JSON.stringify(error.response.data) : error.message} | đang thử lại...`, "warning");
        success = false;
        await sleep(settings.DELAY_BETWEEN_REQUESTS);
        if (currRetries == retries) return { success: false, error: error.message };
      }
      currRetries++;
    } while (currRetries <= retries && !success);
  }

  async auth() {
    return this.makeRequest(
      `${this.baseURL}/public/users/loginByTelegram?tgWebAppStartParam=boink1092680235&p=tdesktop`,
      "post",
      { initDataString: this.queryId, tokenForSignUp: "" },
      { isAuth: true }
    );
  }

  async getUserData() {
    return this.makeRequest(`${this.baseURL}/api/users/me`, "get");
  }

  async getConfig() {
    return this.makeRequest(`${this.baseURL}/public/data/config`, "get");
  }

  async upgradeBoinker() {
    return this.makeRequest(`${this.baseURL}/api/boinkers/upgradeBoinker`, "post", {
      isUpgradeCurrentBoinkerToMax: true,
    });
  }

  async addShitBooster(payload) {
    return this.makeRequest(`${this.baseURL}/api/boinkers/addShitBooster`, "post", payload);
  }

  async spin(type = "spinSlotMachine", spinAmount) {
    return this.makeRequest(`${this.baseURL}/api/play/spin${type.charAt(0).toUpperCase() + type.slice(1)}/${spinAmount}`, "post", {});
  }

  async getTasks() {
    return this.makeRequest(`${this.baseURL}/api/rewardedActions/mine`, "get");
  }

  async getTasksCompleted() {
    return this.makeRequest(`${this.baseURL}/api/rewardedActions/getRewardedActionList`, "get");
  }

  async completeTask(id) {
    return this.makeRequest(`${this.baseURL}/api/rewardedActions/rewardedActionClicked/${id}`, "post", {});
  }

  async claimTask(id) {
    return this.makeRequest(`${this.baseURL}/api/rewardedActions/claimRewardedAction/${id}`, "post", {});
  }

  async clickAds(id) {
    return this.makeRequest(`${this.baseURL}/api/rewardedActions/rewardedActionClicked/${id}`, "post", {});
  }

  async watchAd(payload) {
    return this.makeRequest(`${this.baseURL}/api/rewardedActions/ad-watched`, "post", payload);
  }

  async loginByTelegram() {
    try {
      const response = await this.auth();
      if (response.success) {
        return { success: true, token: response.data.token };
      } else {
        return { success: false, status: response.status };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async handleUpgradeBoinker() {
    try {
      // const configResult = await this.getConfig();
      const response = await this.upgradeBoinker();
      if (response.success) {
        const { newSoftCurrencyAmount, newSlotMachineEnergy, rank } = response.data;
        // if (newSoftCurrencyAmount < configResult.data?.)
        this.log(`Nâng cấp thành công, Coin: ${newSoftCurrencyAmount} | Spin: ${newSlotMachineEnergy} | Rank: ${rank}`, "success");
        return { success: true };
      } else {
        this.log(`Nâng cấp thất bại không đủ số dư!`, "warning");
        return { success: false };
      }
    } catch (error) {
      this.log(`Chưa đủ coin để nâng cấp tiếp!`, "error");
      return { success: false, error: error.message };
    }
  }

  async claimBooster(spin) {
    const payload = spin > 30 ? { multiplier: 2, optionNumber: 3 } : { multiplier: 2, optionNumber: 1 };

    try {
      const response = await this.addShitBooster(payload);
      if (response.success) {
        const result = response.data;
        let nextBoosterTime = result.boinker?.booster?.x2?.lastTimeFreeOptionClaimed ? DateTime.fromISO(result.boinker.booster.x2.lastTimeFreeOptionClaimed) : null;
        if (nextBoosterTime) {
          nextBoosterTime = nextBoosterTime.plus({ hours: 2, minutes: 5 });
        }
        this.log(`Mua boosts thành công! Coin: ${result.userPostBooster.newCryptoCurrencyAmount || 0}`, "success");
        this.log(`Rank: ${result.userPostBooster.rank}`, "info");
        if (nextBoosterTime) {
          this.log(`Mua boosts tiếp theo vào: ${nextBoosterTime.toLocaleString(DateTime.DATETIME_MED)}`, "info");
        } else {
          this.log(`Không thể xác định thời gian mua boosts tiếp theo.`, "warning");
        }

        return { success: true, nextBoosterTime };
      } else {
        this.log(`Lỗi khi mua boosts!`, "error");
        return { success: false, error: "API error" };
      }
    } catch (error) {
      this.log(`Lỗi khi gửi yêu cầu mua boosts: ${error.message}`, "error");
      return { success: false, error: error.message };
    }
  }

  async spinSlotMachine(type, spins) {
    const spinAmounts = [1000, 500, 150, 50, 25, 10, 5, 1];
    let remainingSpins = spins;
    while (remainingSpins > 0) {
      let spinAmount = spinAmounts.find((amount) => amount <= remainingSpins) || 1;
      try {
        const response = await this.spin(type, spinAmount);
        if (response.success) {
          const result = response.data;
          this.log(
            `Spin thành công (${result.outcome}): Coin: ${result.newSoftCurrencyAmount.toString().white}${` | Shit: `.magenta}${result.newCryptoCurrencyAmount.toFixed(2).white}`.magenta,
            "custom"
          );
          remainingSpins -= spinAmount;
        } else {
          this.log(`Lỗi khi quay: Mã trạng thái ${response.status}`, "error");
          break;
        }
      } catch (error) {
        this.log(`Lỗi khi gửi yêu cầu quay: ${error.message}`, "error");
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  async performRewardedActions() {
    try {
      const userInfoResponse = await this.getUserData();
      if (!userInfoResponse.success) {
        this.log(`Không thể lấy thông tin người dùng. Mã trạng thái: ${userInfoResponse.status}`, "error");
        return;
      }
      const userInfo = userInfoResponse.data;

      this.log("Đang lấy danh sách nhiệm vụ...", "info");
      const response = await this.getTasks();
      const responseTasks = await this.getTasksCompleted();

      if (!response.success || !responseTasks.success) {
        this.log(`Không thể lấy danh sách nhiệm vụ. Mã trạng thái: ${response.status}`, "error");
        return;
      }
      let tasksTodo = [];
      let rewardedActions = responseTasks.data;
      let tasks = Object.values(response.data);
      for (const task of tasks) {
        if (!task?.claimDateTime) {
          const isFound = rewardedActions.find((i) => i.nameId == task.nameId);
          if (isFound) {
            tasksTodo.push({ ...isFound, ...task });
          }
        }
      }
      rewardedActions = tasksTodo.filter((action) => !action?.verification && !settings.SKIP_TASKS.includes(action.nameId));
      // rewardedActions = rewardedActions.filter((action) => !action.totalCurrencySoftAwarded && !settings.SKIP_TASKS.includes(action.nameId));
      // this.log(`Đã lấy được ${rewardedActions.length} nhiệm vụ`, "success");
      // fs.appendFileSync("t.txt", JSON.stringify(tasksTodo));
      if (rewardedActions.length == 0) {
        return this.log(`Không có nhiệm vụ nào cần thực hiện`, "warning");
      }
      for (const action of rewardedActions) {
        await sleep(1);
        const nameId = action.nameId;
        const currentTime = new Date();
        let canPerformTask = true;
        let waitTime = null;

        if (userInfo.rewardedActions && userInfo.rewardedActions[nameId]) {
          const lastClaimTime = new Date(userInfo.rewardedActions[nameId].claimDateTime);

          if (nameId === "SeveralHourlsReward") {
            const nextAvailableTime = new Date(lastClaimTime.getTime() + 6 * 60 * 60 * 1000);
            if (currentTime < nextAvailableTime) {
              canPerformTask = false;
              waitTime = nextAvailableTime;
            }
          } else if (nameId === "SeveralHourlsRewardedAdTask" || nameId === "SeveralHourlsRewardedAdTask2") {
            const nextAvailableTime = new Date(lastClaimTime.getTime() + 6 * 60 * 1000);
            if (currentTime < nextAvailableTime) {
              canPerformTask = false;
              waitTime = nextAvailableTime;
            }
          } else if (userInfo.rewardedActions[nameId].claimDateTime) {
            canPerformTask = false;
          }
        }

        if (!canPerformTask) {
          if (waitTime) {
            const waitMinutes = Math.ceil((waitTime - currentTime) / (60 * 1000));
            this.log(`Cần chờ ${waitMinutes} phút để tiếp tục làm nhiệm vụ ${nameId}`, "info");
          } else {
            this.log(`Nhiệm vụ ${nameId} đã được hoàn thành trước đó`, "info");
          }
          continue;
        }
        if (nameId === "SeveralHourlsRewardedAdTask" || nameId === "SeveralHourlsRewardedAdTask2") {
          const providerId = nameId === "SeveralHourlsRewardedAdTask" ? "adsgram" : "onclicka";
          await this.handleAdTask(nameId, providerId);
        } else {
          try {
            const clickResponse = await this.completeTask(nameId);
            // console.log(clickResponse);
            this.log(`Làm nhiệm vụ ${nameId.yellow} | trạng thái: ${`pending`.yellow}`);
          } catch (clickError) {
            this.log(`Lỗi khi làm nhiệm vụ ${nameId}: ${clickError.message}`, "error");
            if (clickError.response) {
              this.log(`Chi tiết lỗi: ${JSON.stringify(clickError.response.data)}`, "error");
            }
            continue;
          }

          if (action.secondsToAllowClaim > 0) {
            this.log(`Đợi ${action.secondsToAllowClaim} giây...`);
            await sleep(action.secondsToAllowClaim);
          }

          try {
            const claimResponse = await this.claimTask(nameId);
            if (claimResponse.success && claimResponse.data) {
              const result = claimResponse.data;
              const reward = result.prizeGotten;
              this.log(`Hoàn thành nhiệm vụ ${nameId} thành công | Phần thưởng: ${reward || JSON.stringify(result)}`, "success");
            } else {
              this.log(`Không thể nhận thưởng cho ${nameId} | ${JSON.stringify(claimResponse)}`, "error");
            }
          } catch (claimError) {
            this.log(`Lỗi khi nhận thưởng cho ${nameId}: thời gian chờ vẫn còn!`, "warning");
          }
        }

        await sleep(1);
      }
    } catch (error) {
      this.log(`Lỗi khi thực hiện các nhiệm vụ: ${error.message}`, "error");
      if (error.response) {
        this.log(`Chi tiết lỗi: ${JSON.stringify(error.response.data)}`, "error");
      }
    }
  }

  async handleAdTask(nameId, providerId) {
    try {
      await this.clickAds(nameId);
      this.log(`Đã click nhiệm vụ quảng cáo ${nameId}`, "success");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await this.watchAd({ providerId });
      this.log(`Đã xác nhận xem quảng cáo cho ${nameId}`, "success");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      this.log(`Gửi yêu cầu nhận thưởng cho nhiệm vụ quảng cáo ${nameId}...`, "info");
      const claimResponse = await this.claimTask(nameId);

      if (claimResponse.succes

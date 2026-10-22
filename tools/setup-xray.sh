#!/bin/bash
# Xray VLESS + Reality 一键安装脚本(自用代理节点)
# 用法:以 root 登录服务器后运行: bash setup-xray.sh
set -e

[ "$(id -u)" -eq 0 ] || { echo "请用 root 运行"; exit 1; }

# 1. 安装 xray(官方安装脚本)
bash -c "$(curl -L https://github.com/XTLS/Xray-install/raw/main/install-release.sh)" @ install

# 2. 生成随机参数(每次运行都不同,不留默认值)
UUID=$(/usr/local/bin/xray uuid)
PRIV=$(/usr/local/bin/xray x25519 | grep -i private | awk '{print $3}')
PUB=$(/usr/local/bin/xray x25519 | grep -i public | awk '{print $3}')
SHORTID=$(od -An -tx1 -N4 /dev/urandom | tr -d ' \n')

# 3. 写入配置:VLESS + TCP + Reality(端口 443,伪装成 www.microsoft.com)
cat > /usr/local/etc/xray/config.json <<EOF
{
  "log": { "loglevel": "warning" },
  "inbounds": [
    {
      "listen": "0.0.0.0",
      "port": 443,
      "protocol": "vless",
      "settings": {
        "clients": [{ "id": "$UUID", "flow": "xtls-rprx-vision" }],
        "decryption": "none"
      },
      "streamSettings": {
        "network": "tcp",
        "security": "reality",
        "realitySettings": {
          "dest": "1.1.1.1:443",
          "serverNames": ["www.microsoft.com"],
          "privateKey": "$PRIV",
          "shortIds": ["$SHORTID"]
        }
      }
    }
  ],
  "outbounds": [{ "protocol": "freedom" }]
}
EOF

# 4. 重启 xray 使配置生效
systemctl restart xray
systemctl enable xray >/dev/null 2>&1

# 5. 输出客户端导入链接
IP=$(curl -4 -s ifconfig.me || curl -4 -s ip.sb || echo "你的服务器IP")
echo ""
echo "================ 节点搭建完成 ================"
echo "复制下面这行,粘贴到 v2rayN 里导入:"
echo ""
echo "vless://$UUID@$IP:443?encryption=none&security=reality&sni=www.microsoft.com&fp=chrome&pbk=$PUB&sid=$SHORTID&type=tcp&flow=xtls-rprx-vision#US节点"
echo ""
echo "=============================================="

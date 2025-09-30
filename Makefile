.PHONY: help install dev build start stop clean logs migrate

# 默认目标
help:
	@echo "Token Monitor Platform - 可用命令:"
	@echo "  make install    - 安装所有依赖"
	@echo "  make dev        - 启动开发环境"
	@echo "  make build      - 构建项目"
	@echo "  make start      - 启动 Docker 服务"
	@echo "  make stop       - 停止 Docker 服务"
	@echo "  make restart    - 重启 Docker 服务"
	@echo "  make logs       - 查看服务日志"
	@echo "  make migrate    - 运行数据库迁移"
	@echo "  make clean      - 清理构建产物"
	@echo "  make db-studio  - 打开数据库管理界面"

# 安装依赖
install:
	@echo "📦 安装后端依赖..."
	cd backend && npm install
	@echo "📦 安装前端依赖..."
	cd frontend && npm install
	@echo "✅ 依赖安装完成"

# 开发环境
dev:
	@echo "🚀 启动开发环境..."
	@echo "请在两个终端中分别运行:"
	@echo "  终端1: cd backend && npm run dev"
	@echo "  终端2: cd frontend && npm run dev"

# 构建项目
build:
	@echo "🔨 构建后端..."
	cd backend && npm run build
	@echo "🔨 构建前端..."
	cd frontend && npm run build
	@echo "✅ 构建完成"

# Docker 命令
start:
	@echo "🚀 启动 Docker 服务..."
	docker-compose up -d
	@echo "✅ 服务已启动"
	@echo "前端: http://localhost:3000"
	@echo "后端: http://localhost:3001"

stop:
	@echo "⏹️  停止 Docker 服务..."
	docker-compose down
	@echo "✅ 服务已停止"

restart:
	@echo "🔄 重启 Docker 服务..."
	docker-compose restart
	@echo "✅ 服务已重启"

logs:
	docker-compose logs -f

# 数据库迁移
migrate:
	@echo "🗄️  运行数据库迁移..."
	cd backend && npx prisma migrate dev
	@echo "✅ 迁移完成"

# 数据库管理界面
db-studio:
	@echo "🎨 打开 Prisma Studio..."
	cd backend && npx prisma studio

# 清理
clean:
	@echo "🧹 清理构建产物..."
	rm -rf backend/dist
	rm -rf frontend/dist
	rm -rf backend/node_modules/.cache
	rm -rf frontend/node_modules/.cache
	@echo "✅ 清理完成"

# 完全清理（包括 node_modules）
clean-all: clean
	@echo "🧹 完全清理..."
	rm -rf backend/node_modules
	rm -rf frontend/node_modules
	docker-compose down -v
	@echo "✅ 完全清理完成"
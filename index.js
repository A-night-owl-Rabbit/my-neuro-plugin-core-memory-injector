const { Plugin } = require('../../../js/core/plugin-base.js');
const fs = require('fs');
const path = require('path');

const MEMORY_FILE = path.join(__dirname, '..', '..', '..', 'AI记录室', '核心用户记忆.txt');

class CoreMemoryInjector extends Plugin {

    async onInit() {
        this._watcher = null;
        this._cachedMemory = null;
    }

    async onStart() {
        this._loadMemory();
        this._watchFile();
        this.context.log('info', `核心记忆注入插件已启动，监听文件: ${MEMORY_FILE}`);
    }

    async onStop() {
        this._unwatchFile();
        this._cachedMemory = null;
    }

    /**
     * 每次 LLM 请求前，将核心记忆注入到 system 消息中。
     * 操作的是 deep copy 的 messagesForAPI，不会污染持久化的 messages。
     */
    async onLLMRequest(request) {
        if (!this._cachedMemory) return;

        const sysMsg = request.messages.find(m => m.role === 'system');
        if (sysMsg) {
            sysMsg.content += `\n\n【核心用户记忆 - 请务必牢记以下内容】\n${this._cachedMemory}`;
        }
    }

    _loadMemory() {
        try {
            if (!fs.existsSync(MEMORY_FILE)) {
                this.context.log('warn', '核心用户记忆.txt 不存在，跳过加载');
                this._cachedMemory = null;
                return;
            }
            const raw = fs.readFileSync(MEMORY_FILE, 'utf-8').trim();
            if (!raw) {
                this.context.log('warn', '核心用户记忆.txt 为空，跳过加载');
                this._cachedMemory = null;
                return;
            }
            this._cachedMemory = raw;
            this.context.log('info', `核心记忆已加载，长度: ${raw.length} 字符`);
        } catch (e) {
            this.context.log('error', `读取核心记忆失败: ${e.message}`);
            this._cachedMemory = null;
        }
    }

    _watchFile() {
        try {
            const dir = path.dirname(MEMORY_FILE);
            const base = path.basename(MEMORY_FILE);
            this._watcher = fs.watch(dir, (eventType, filename) => {
                if (filename === base) {
                    clearTimeout(this._debounce);
                    this._debounce = setTimeout(() => {
                        this.context.log('info', '核心记忆文件已变更，重新加载...');
                        this._loadMemory();
                    }, 1000);
                }
            });
        } catch (e) {
            this.context.log('warn', `无法监听记忆文件变更: ${e.message}`);
        }
    }

    _unwatchFile() {
        if (this._watcher) {
            this._watcher.close();
            this._watcher = null;
        }
        clearTimeout(this._debounce);
    }
}

module.exports = CoreMemoryInjector;

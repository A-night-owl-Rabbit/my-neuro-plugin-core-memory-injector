const { Plugin } = require('../../../js/core/plugin-base.js');
const fs = require('fs');
const path = require('path');

const PATCH_ID = 'core-memory';
const MEMORY_FILE = path.join(__dirname, '..', '..', '..', 'AI记录室', '核心用户记忆.txt');

class CoreMemoryInjector extends Plugin {

    async onInit() {
        this._watcher = null;
    }

    async onStart() {
        this._inject();
        this._watchFile();
        this.context.log('info', `核心记忆已注入，监听文件变更: ${MEMORY_FILE}`);
    }

    async onStop() {
        this._unwatchFile();
        this.context.removeSystemPromptPatch(PATCH_ID);
    }

    _inject() {
        try {
            if (!fs.existsSync(MEMORY_FILE)) {
                this.context.log('warn', '核心用户记忆.txt 不存在，跳过注入');
                return;
            }
            const raw = fs.readFileSync(MEMORY_FILE, 'utf-8').trim();
            if (!raw) {
                this.context.log('warn', '核心用户记忆.txt 为空，跳过注入');
                return;
            }

            const patch = `\n【核心用户记忆 - 请务必牢记以下内容】\n${raw}`;
            this.context.addSystemPromptPatch(PATCH_ID, patch);
        } catch (e) {
            this.context.log('error', `读取核心记忆失败: ${e.message}`);
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
                        this.context.log('info', '核心记忆文件已变更，重新注入...');
                        this._inject();
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

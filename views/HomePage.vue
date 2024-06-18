<template>
    <div style="padding:10px; margin:10px; border:1px solid green;display: flex;justify-content: space-between;"
        @contextmenu.prevent="showContentMenu">
        <div class="content-in">
            <n-card title="图片处理">
                <template #header-extra> </template>
                <n-form :model="formValue" :rules="rules">
                    <n-space justify="space-between">
                        <n-button @click="select_Path">保存路径</n-button>
                        <n-button @click="read_File" style="margin-bottom: 20px;">上传文件</n-button>

                    </n-space>
                    <n-form-item label="放大倍数" path="user.scale">
                        <n-input v-model:value="formValue.user.scale" placeholder="输入放大倍数" />
                    </n-form-item>
                    <n-form-item label="降噪等级" path="user.noisy">
                        <n-input v-model:value="formValue.user.noisy" placeholder="输入降噪等级" />
                    </n-form-item>

                </n-form>
                <p>选择模型 <span style="color: red;">*</span></p>
                <n-select v-model:value="valueModel" :options="selectModel" />
                <template #footer>
                    <n-button @click="imgProcess">提交</n-button>
                </template>
            </n-card>
        </div>
        <div style="width:50%">
            <n-table v-for="(item, index) in filelist.slice(0, 6)" :bordered="false" :single-line="true"
                :key="item.path">
                <thead v-if="index == 0">
                    <tr>
                        <th>图片路径</th>
                        <th>保存路径</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{{ item.path }}</td>
                        <td>{{ item.savePath }}</td>
                    </tr>
                </tbody>
            </n-table>
            <n-button @click="clearList">清空队列</n-button>
        </div>
    </div>
    <div class="processDiv">
        <div class='process'>
            <n-progress type="line" :percentage="percentage" :indicator-placement="'inside'" processing />
        </div>
        <n-button>中止</n-button>
    </div>

</template>
<script setup>
import { reactive, ref, watch } from 'vue'
let percentage = ref(0)
const formValue = reactive({
    user: {
        scale: null,
        noisy: null
    },
})
let rules = {
    user: {
        scale: [{
            required: true,
            message: "请输入放大倍数",
            trigger: 'blur',
        }, {
            min: 0,
            max: 32,
            message: "请输入0-2之间的2的倍数",
            trigger: 'blur',
        }],
        noisy: [{
            required: true,
            message: "请输入降噪等级",
            trigger: 'blur',
        }, {
            max: 3,
            message: "最大为3",
            trigger: 'blur',
        }]
    }
}
let filelist = reactive([
    { path: '你的图片路径D:/Image', savePath: '你的保存路径D:/Save' }
])
let saveImagePath = ''
let valueModel = ref('0')
const selectModel = ref([
    {
        label: 'waifu2x',
        value: '0'
    },
    {
        label: 'realgansr',
        value: '1'
    }
])
window.electronAPI.sendValue(valueModel.value)
watch(valueModel, (newValue, oldValue) => {
    if (newValue !== oldValue) {
        window.electronAPI.sendValue(newValue)
    }
});
function imgProcess() {
    let tmp_per = 0
    // console.log(valueModel.value==='0');
    let noisy = formValue.user.noisy;
    let scale = formValue.user.scale;
    noisy = parseInt(noisy, 10) > 3 ? '3' : noisy;
    scale = parseInt(scale, 10) > 32 ? '32' : scale;
    const fileLen = filelist.length
    for (let i in filelist) {
        window.electronAPI.processImage(filelist[i].path, saveImagePath, valueModel.value, noisy, scale)

    }
    window.electronAPI.watchValue((per) => {
        tmp_per += per
        percentage.value = parseInt((tmp_per / fileLen) * 100)
        console.log(percentage.value, per);
        if (percentage.value == 100) {
            window.electronAPI.sendMsg({
                title: `${selectModel.value[valueModel.value].label}`,
                body: '已完成'
            })
        }
    });
}
function read_File() {
    window.electronAPI.openFile()
    window.electronAPI.fileListFun((files) => {
        filelist.pop()
        console.log(files);
        for (let i of files) {
            console.log(i);
            filelist.push({
                path: i,
                savePath: saveImagePath
            })
        }
    })
}
function clearList() {
    console.log(filelist.length);
    filelist.splice(0, filelist.length)
    filelist.push({ path: '你的图片路径D:/Image', savePath: '你的保存路径D:/Save' })
}
function select_Path() {
    window.electronAPI.openDir()
    window.electronAPI.savePath((fileDir) => {
        console.log(fileDir[0]);
        saveImagePath = fileDir[0]
    })
}
function showContentMenu(event) {
    window.electronAPI.contentMenu(event.pageX, event.pageY)
}
</script>
<style lang="scss" scoped>
.content-in {
    width: 40%;
}

.processDiv {
    width: 1200px;
    height: 40px;
    margin-top: 20px;
    margin-left: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row
}

.processDiv .process {
    width: 800px;
}
</style>

<template>
  <div class="field-picker-box">
    <div class="field-picker oh pr" :class="{selected: selected}" @click="pickerShow">
      <span class="text l">{{fieldTitle}}<i class="tip" v-if="require">*</i></span>
      <span class="arrow r"></span>
      <span class="result r" v-html="pickerResult"></span>
    </div>
    <mt-popup
      v-model="popupVisible"
      position="bottom"
      pop-transition="popup-fade">
      <mt-picker :slots="slots" @change="onValuesChange" showToolbar :valueKey="pickerValue">
        <div class="picker-toolbar">
          <span class="mint-datetime-action mint-datetime-cancel" @click="pickerCancel">取消</span>
          <span class="mint-datetime-action mint-datetime-confirm" @click="pickerConfirm">确定</span>
        </div>
      </mt-picker>
    </mt-popup>
  </div>
</template>

<script>
export default {
  props: {
    fieldTitle: {
      type: String,
      default: ''
    },
    require: {
      type: Boolean,
      default: true
    },
    fieldValue: {
      type: String,
      default: '请选择'
    },
    fieldOptions: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  created(){
    this.selected = this.fieldValue === '请选择' || this.fieldValue === '' ? false : true
    this.pickerResult = this.fieldValue === '请选择' || this.fieldValue === '' ? '请选择' : this.fieldValue
    this.pickerValue = this.fieldValue
    
  },
  watch: {
    'fieldOptions'(val){
      this.slots = [
        {
          values: ['请选择'].concat(val)
        }
      ]
    }
  },
  data() {
    return {
      selected: false,
      popupVisible: false,
      pickerResult: '',
      slots: null
    }
  },
  methods: {
    pickerShow() {
      this.popupVisible = true
    },
    pickerConfirm() {
      this.selected = this.pickerValue === '请选择' ? false: true
      this.pickerResult = this.pickerValue
      this.popupVisible = false
      this.$emit('fieldChange',{value: this.pickerResult,index: this.fieldOptions.indexOf(this.pickerResult)})
    },
    pickerCancel() {
      this.popupVisible = false
    },
    onValuesChange(picker, values) {
      this.pickerValue = values[0]
    }
  }
}
</script>

<style lang="less" scoped>
.mint-popup {
  width: 100%;

  .picker-toolbar {
    border-bottom: solid 1px #eaeaea;
  }
}
.field-picker {
  height: 1.1rem;
  padding-left: .52rem;
  font-size: .32rem;
  color: #262626;
  line-height: 1.1rem;

  &::after {
    position: absolute;
    content: '';
    left: .45rem;
    right: 0;
    bottom: 0;
    z-index: 1;
    height: 1px;
    background-color: #eee;
  }

  &.selected .result {
    color: #9f9f9f;
  }

  .tip {
    color: #ff0000;
  }

  .arrow {
    width: .67rem;
    height: 100%;
    background: url("../assets/images/arrow-right.png") center center no-repeat;
    background-size: .15rem .26rem;
  }

  .result {
    max-width: 4.36rem;
    margin-right: .1rem;
    font-size: .36rem;
    color: #c3c3c3;
  }
}
</style>

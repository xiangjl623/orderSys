<template>
  <div class="contain">
    <div>
      <el-form :inline="true">
        <el-form-item label="单号">
          <el-input v-model="formQuery.orderNum" clearable placeholder="请输入单号" />
        </el-form-item>
        <el-form-item label="公司名称">
          <el-select v-model="formQuery.companyName" clearable placeholder="请选择公司">
            <el-option v-for="(item, index) in companyList" :key="index" :value="item.companyName" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期">
          <el-date-picker
            v-model="formQuery.orderTime"
            type="daterange"
            range-separator="至"
            value-format="yyyy-MM-dd"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="setTime"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getOrderList">查询</el-button>
          <el-button type="primary" @click="dialogVisible = true; isEdit = false;">新增</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div>
      <el-table
        :data="ordertableData"
        :header-cell-style="{ textAlign: 'center' }"
        :cell-style="{ textAlign: 'center', fontSize: '18px' }"
        show-summary
        style="width: 100%"
      >
        <el-table-column
          prop="orderNum"
          label="单号"
        >
          <template slot-scope="{row}">
            <span style="color: rgb(64,158,255); cursor: pointer;" @click="modify(row)">
              {{ row.orderNum }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          prop="companyName"
          label="公司名称"
        />
        <el-table-column
          prop="orderTime"
          label="单号日期"
        >
          <template slot-scope="{row}">
            {{ row.orderTime.split('T')[0] }}
          </template>
        </el-table-column>
        <el-table-column
          prop="orderTotalPrice"
          label="单号总额"
        />
        <el-table-column
          label="操作"
        >
          <template slot-scope="{row}">
            <el-button type="warning" size="small" @click="modify(row)">修改</el-button>
            <el-button type="danger" size="small" @click="deleteOrder(row._id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-dialog
      title="提示"
      :visible.sync="dialogVisible"
      width="64%"
      :close-on-click-modal="false"
      :before-close="() => {dialogVisible = false}"
      @closed="closeDialog"
    >
      <div>
        <el-form ref="formData" :model="formData" :inline="true">
          <el-form-item label="单号" prop="orderNum" required>
            <el-input v-model="formData.orderNum" style="width: 168px;" clearable placeholder="请输入单号" />
          </el-form-item>
          <el-form-item label="公司名称" prop="companyName" required>
            <el-select v-model="formData.companyName" style="width: 168px;" clearable placeholder="请选择公司" @change="getPriceAndModelsByCompany">
              <el-option v-for="(item, index) in companyList" :key="index" :value="item.companyName" />
            </el-select>
          </el-form-item>
          <el-form-item label="日期" prop="orderTime" required>
            <el-date-picker
              v-model="formData.orderTime"
              type="date"
              style="width: 168px;"
              value-format="yyyy-MM-dd"
              placeholder="选择日期"
            />
          </el-form-item>
          <el-form-item label="m³单价" prop="unitPrice" required>
            <el-input v-model="formData.unitPrice" style="width: 168px;" clearable placeholder="请输入每立方单价" />
          </el-form-item>
        </el-form>
        <vxe-table
          ref="xTable"
          border
          resizable
          show-footer
          show-overflow
          :data="tableData"
          :footer-method="footerMethod"
          align="center"
          :export-config="{}"
          class="mytable-style"
          :edit-config="{trigger: 'click', mode: 'cell', showIcon: false}"
        >
          <vxe-column :title="'单号： ' + formData.orderNum">
            <vxe-column
              type="seq"
              title="序号"
              width="60"
            />
            <vxe-column
              field="modelName"
              title="型号"
              :edit-render="{type: 'default'}"
            >
              <template #edit="scope">
                <el-select v-model="scope.row.modelName" clearable filterable placeholder="请选择型号" @change="val => setSize(val, scope)">
                  <el-option v-for="(item, index) in modelList" :key="index" :value="item.modelName" />
                </el-select>
              </template>
              <template v-slot="{row}">
                {{ row.modelName }}
              </template>
            </vxe-column>
            <vxe-column
              field="leng"
              title="长"
              width="70"
            />
            <vxe-column
              field="width"
              title="宽"
              width="70"
            />
            <vxe-column
              field="height"
              title="高"
              width="70"
            />
            <vxe-column
              field="volume"
              title="体积"
              width="100"
            />
          </vxe-column>
          <vxe-colgroup :title="'日期： ' + formData.orderTime.split('T')[0]">
            <vxe-column
              field="price"
              title="价格"
              width="140"
            >
              <template #default="{ row }">
                <span>{{ getPrice(row) }}</span>
              </template>
            </vxe-column>
            <vxe-column
              field="amount"
              title="数量"
              width="120"
              :edit-render="{name: 'input', attrs: {type: 'number'}}"
            />
            <vxe-column
              field="totalPrice"
              title="总价"
              width="140"
            >
              <template #default="{ row }">
                <span>{{ getTotalPrice(row) }}</span>
              </template>
            </vxe-column>
          </vxe-colgroup>

        </vxe-table>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="exportExcel">导 出</el-button>
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submit">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>
<script>
// import XEUtils from 'xe-utils'
import { getCompanyList } from '@/api/company'
import { getModelList } from '@/api/model'
import { getOrderList, addOrder, updateOrder, delOrder } from '@/api/order'
export default {
  name: 'OrderManage',
  data() {
    return {
      modelName: '',
      isEdit: false,
      formQuery: {
        orderNum: '',
        companyName: '',
        startTime: '',
        endTime: '',
        orderTime: ''
      },
      formData: {
        orderNum: '',
        companyName: '',
        orderTime: '',
        unitPrice: '',
        orderTotalPrice: ''
      },
      dialogVisible: false,
      companyList: [],
      ordertableData: [],
      tableData: [
        { modelName: '', leng: '', width: '', height: '', volume: '', price: '', amount: '', totalPrice: '' },
        { modelName: '', leng: '', width: '', height: '', volume: '', price: '', amount: '', totalPrice: '' },
        { modelName: '', leng: '', width: '', height: '', volume: '', price: '', amount: '', totalPrice: '' },
        { modelName: '', leng: '', width: '', height: '', volume: '', price: '', amount: '', totalPrice: '' },
        { modelName: '', leng: '', width: '', height: '', volume: '', price: '', amount: '', totalPrice: '' },
        { modelName: '', leng: '', width: '', height: '', volume: '', price: '', amount: '', totalPrice: '' },
        { modelName: '', leng: '', width: '', height: '', volume: '', price: '', amount: '', totalPrice: '' },
        { modelName: '', leng: '', width: '', height: '', volume: '', price: '', amount: '', totalPrice: '' },
        { modelName: '', leng: '', width: '', height: '', volume: '', price: '', amount: '', totalPrice: '' },
        { modelName: '', leng: '', width: '', height: '', volume: '', price: '', amount: '', totalPrice: '' },
        { modelName: '', leng: '', width: '', height: '', volume: '', price: '', amount: '', totalPrice: '' }
      ],
      modelList: [],
      pnameList: [],
      cachePnameList: []
    }
  },
  mounted() {
    this.getCompanyList()
    this.getOrderList()
  },
  methods: {
    async getOrderList() {
      const res = await getOrderList(this.formQuery)
      if (res.code === 20000) {
        this.ordertableData = res.data
        // this.tableData = res.data[0].modelList
      }
    },
    async getCompanyList() {
      const res = await getCompanyList()
      if (res.code === 20000) {
        this.companyList = res.data
      }
    },
    deleteOrder(_id) {
      this.$confirm('此操作将删除该记录, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        const res = await delOrder({ _id })
        if (res.code === 20000) {
          this.$message.success('成功')
          this.getOrderList()
        }
      }).catch(() => {})
    },
    getModelNameById(id) {
      const modelName = this.modelList.find(item => {
        return item.id === id
      }).modelName
      if (modelName) {
        return modelName
      }
    },
    setSize(val, scope) {
      const sizes = this.modelList.find(item => {
        return item.modelName === val
      })
      if (sizes) {
        scope.row.leng = sizes.leng
        scope.row.height = sizes.height
        scope.row.width = sizes.width
        scope.row.volume = sizes.volume
      }
    },
    closeDialog() {
      // this.$refs.xTable.clearData()
      this.$refs['formData'].resetFields()
    },
    getPrice(row) {
      row.price = this.formData.unitPrice * row.volume
      if (row.price) {
        return Number(row.price).toFixed(6) + '元'
      }
    },
    modify(row) {
      this.isEdit = true
      this.dialogVisible = true
      this.$nextTick(() => {
        this.formData = { ...row }
        this.tableData = [...row.modelList]
        this.getPriceAndModelsByCompany(this.formData.companyName)
      })
    },
    getTotalPrice(row) {
      row.totalPrice = row.price * row.amount
      if (row.totalPrice) {
        return Number(row.totalPrice).toFixed(6)
      } else {
        return ''
      }
    },
    setTime(val) {
      this.formQuery.startTime = val[0]
      this.formQuery.endTime = val[1]
    },
    async exportExcel() {
      const { orderTime, orderNum, companyName } = this.formData
      if (orderTime && orderNum) {
        this.$refs.xTable.exportData({ filename: `${orderNum}-${companyName}`, type: 'xlsx', sheetName: companyName, useStyle: true })
      } else {
        this.$message.warning('请输入单号和日期')
      }
    },
    submit() {
      this.$refs['formData'].validate(async(valid) => {
        if (valid) {
          if (this.isEdit) {
            // this.tableData.forEach((item, index) => {
            //   if (!item.modelName) {
            //     this.tableData.splice(index, 1)
            //   }
            // })
            this.formData['modelList'] = [...this.tableData]
            const res = await updateOrder(this.formData)
            if (res.code === 20000) {
              this.$message.success('成功')
              this.getModelList()
              this.dialogVisible = false
            }
          } else {
            this.formData._id = null
            this.formData['modelList'] = [...this.tableData]
            const res = await addOrder(this.formData)
            if (res.code === 20000) {
              this.$message.success('成功')
              this.getOrderList()
              this.dialogVisible = false
            }
          }
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    footerMethod({ columns, data }) {
      return [
        columns.map((column, columnIndex) => {
          if (columnIndex === 0) {
            return '合计'
          }
          if (columnIndex === 7) {
            return `${this.sumNum(data, 'amount')}`
          } else if (columnIndex === 8) {
            this.formData.orderTotalPrice = this.sumPrice(data)
            return `共 ${this.formData.orderTotalPrice} 元`
          }
          return '-'
        })
      ]
    },
    async getPriceAndModelsByCompany(val) {
      this.formData.unitPrice = this.companyList.find(item => {
        return item.companyName === val
      }).unitPrice
      const res = await getModelList({ companyName: val, page: 1, size: 99999 })
      if (res.code === 20000) {
        this.modelList = res.data.results
      }
    },
    sumNum(list, field) {
      let count = 0
      list.forEach(item => {
        count += Number(item[field])
      })
      return count
    },
    sumPrice(data) {
      let count = 0
      data.forEach(row => {
        count += Number(this.getTotalPrice(row))
      })
      return count
    },
    editMethod({ row, column }) {
      const $table = this.$refs.xTable
      // 重写默认的覆盖式，改为追加式
      $table.setActiveCell(row, column)
    }
  }
}
</script>
<style>
.contain {
  padding: 12px;
}
.vxe-select--panel {
  z-index: 9997 !important
}
.el-dialog__body {
  padding: 0px 20px 10px;
}
.el-dialog__footer {
  padding: 10px 20px 10px;
}
.el-dialog {
  margin-top: 5vh !important;
}
</style>

<template>
  <div class="contain">
    <div>
      <el-form :inline="true">
        <el-form-item label="型号">
          <el-input v-model="modelName" clearable placeholder="请输入型号" />
        </el-form-item>
        <el-form-item label="公司">
          <el-select v-model="companyName" clearable placeholder="请选择公司">
            <el-option v-for="(item, index) in companyList" :key="index" :value="item.companyName" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getModelList">查询</el-button>
          <el-button type="primary" @click="dialogVisible = true; isEdit = false">新增</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div>
      <el-table
        :data="tableData"
        :header-cell-style="{ textAlign: 'center' }"
        :cell-style="{ textAlign: 'center', fontSize: '18px' }"
        style="width: 100%"
      >
        <el-table-column
          prop="companyName"
          label="公司名称"
        />
        <el-table-column
          prop="modelName"
          label="型号"
        />
        <el-table-column
          prop="size"
          label="尺寸(长X宽X高)"
        >
          <template slot-scope="{row}" style="">
            {{ row.leng + ' X ' + row.width + ' X ' + row.height }}
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
        >
          <template slot-scope="{row}">
            <el-button type="warning" size="small" @click="modify(row)">修改</el-button>
            <el-button type="danger" size="small" @click="deleteCompany(row._id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        style="float: right"
        :current-page="currentPage"
        :page-sizes="[10, 50, 100, 200]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="modelTotal"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    <el-dialog
      title="提示"
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      width="400px"
      :before-close="()=> {dialogVisible=false}"
      @closed="resetForm"
    >
      <div>
        <el-form ref="formData" :model="formData" label-width="100px">
          <el-form-item label="公司名称" prop="companyName" required>
            <el-select v-model="formData.companyName" style="width: 180px;" clearable placeholder="请选择公司">
              <el-option v-for="(item, index) in companyList" :key="index" :value="item.companyName" />
            </el-select>
          </el-form-item>
          <el-form-item label="型号" prop="modelName" required>
            <el-input v-model="formData.modelName" style="width: 180px;" clearable placeholder="请输入型号" />
          </el-form-item>
          <el-form-item label="长" prop="leng" required>
            <el-input v-model="formData.leng" style="width: 180px;" clearable placeholder="请输入长" />
          </el-form-item>
          <el-form-item label="宽" prop="width" required>
            <el-input v-model="formData.width" style="width: 180px;" clearable placeholder="请输入宽" />
          </el-form-item>
          <el-form-item label="高" prop="height" required>
            <el-input v-model="formData.height" style="width: 180px;" clearable placeholder="请输入高" />
          </el-form-item>
          <el-form-item label="体积" prop="volume">
            <el-input v-model="formData.volume" style="width: 180px;" disabled clearable placeholder="请输入长宽高" />
          </el-form-item>

        </el-form>
        <div style="font-size:12px; color: #909399;">
          注：长宽高单位应为厘米（cm），体积将自动换算为米（m³）
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="onSubmit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { getModelList, updateModel, delModel, addModel } from '@/api/model'
import { getCompanyList } from '@/api/company'
export default {
  name: 'ModelManage',
  data() {
    return {
      dialogVisible: false,
      companyName: '',
      isEdit: false,
      modelName: '',
      page: 1,
      modelTotal: 1,
      size: 10,
      tableData: [],
      formData: {
        companyName: '',
        modelName: '',
        leng: '',
        width: '',
        height: '',
        volume: ''
      },
      companyList: []
    }
  },
  computed: {
    volume() {
      return this.formData.leng * this.formData.width * this.formData.height / 1000000
    }
  },
  watch: {
    volume(value) {
      this.formData.volume = value
    }
  },
  mounted() {
    this.getCompanyList()
    this.getModelList()
  },
  methods: {
    handleSizeChange(val) {
      this.size = val
      this.getModelList()
    },
    handleCurrentChange(val) {
      this.page = val
      this.getModelList()
    },
    modify(row) {
      this.isEdit = true
      this.dialogVisible = true
      this.$nextTick(() => {
        this.formData = { ...row }
      })
    },
    resetForm() {
      this.$refs['formData'].resetFields()
    },
    onSubmit() {
      this.$refs['formData'].validate(async(valid) => {
        if (valid) {
          if (this.isEdit) {
            const res = await updateModel(this.formData)
            if (res.code === 20000) {
              this.$message.success('成功')
              this.getModelList()
              this.dialogVisible = false
              this.resetForm()
            }
          } else {
            this.formData._id = null
            const res = await addModel(this.formData)
            if (res.code === 20000) {
              this.$message.success('成功')
              this.getModelList()
              this.dialogVisible = false
              this.resetForm()
            }
          }
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    deleteCompany(_id) {
      this.$confirm('此操作将删除该记录, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        const res = await delModel({ _id })
        if (res.code === 20000) {
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
          this.getModelList()
        }
      }).catch(() => {})
    },
    async getCompanyList() {
      const res = await getCompanyList({ companyName: this.companyName })
      if (res.code === 20000) {
        this.companyList = res.data
      } else {
        this.$message.error('数据获取失败，请联系管理员')
      }
    },
    async getModelList() {
      const obj = {
        modelName: this.modelName,
        companyName: this.companyName,
        size: this.size,
        page: this.page
      }
      const res = await getModelList(obj)
      if (res.code === 20000) {
        this.tableData = res.data.results
        this.modelTotal = res.data.total
      }
    }
  }
}
</script>
<style scoped>
.contain {
  padding: 12px;
}
</style>

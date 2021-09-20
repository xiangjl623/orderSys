<template>
  <div class="contain">
    <div>
      <el-form :inline="true">
        <el-form-item label="公司名称">
          <el-input v-model="companyName" clearable placeholder="请输入公司名称" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getCompanyList">查询</el-button>
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
          prop="unitPrice"
          label="单价"
        />
        <el-table-column
          prop="tel"
          label="联系方式"
        />
        <el-table-column
          prop="address"
          label="地址"
        />
        <el-table-column
          label="操作"
        >
          <template slot-scope="{row}">
            <el-button type="warning" size="small" @click="modify(row)">修改</el-button>
            <el-button type="danger" size="small" @click="deleteCompany(row._id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-dialog
      title="提示"
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      width="40%"
      :before-close="() => {dialogVisible = false}"
    >
      <div>
        <el-form ref="formData" :model="formData" class="demo-form-inline">
          <el-form-item label="公司名称" prop="companyName" required>
            <el-input v-model="formData.companyName" clearable placeholder="请输入公司名称" />
          </el-form-item>
          <el-form-item label="单价" prop="unitPrice" required>
            <el-input v-model.number="formData.unitPrice" clearable placeholder="请输入m³立方单价" />
          </el-form-item>
          <el-form-item label="联系方式" prop="tel">
            <el-input v-model="formData.tel" clearable placeholder="请输入公司联系方式" />
          </el-form-item>
          <el-form-item label="地址" prop="address">
            <el-input v-model="formData.address" clearable placeholder="请输入公司地址" />
          </el-form-item>

        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="onSubmit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { getCompanyList, delCompany, addCompany, updateCompany } from '@/api/company'
export default {
  name: 'CompanyManage',
  data() {
    return {
      dialogVisible: false,
      isEdit: false,
      companyName: '',
      formData: {
        companyName: '',
        tel: '',
        address: ''
      },
      tableData: []
    }
  },
  mounted() {
    this.getCompanyList()
  },
  methods: {
    modify(row) {
      this.isEdit = true
      this.dialogVisible = true
      this.$nextTick(() => {
        this.formData = { ...row }
      })
    },
    onSubmit() {
      this.$refs['formData'].validate(async(valid) => {
        if (valid) {
          if (this.isEdit) {
            const res = await updateCompany(this.formData)
            if (res.code === 20000) {
              this.$message.success('成功')
              this.getCompanyList()
              this.dialogVisible = false
              this.$refs['formData'].resetFields()
            }
          } else {
            this.formData._id = null
            const res = await addCompany(this.formData)
            if (res.code === 20000) {
              this.$message.success('成功')
              this.getCompanyList()
              this.dialogVisible = false
              this.$refs['formData'].resetFields()
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
        const res = await delCompany({ _id })
        if (res.code === 20000) {
          this.getCompanyList()
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        }
      }).catch(() => {})
    },
    async getCompanyList() {
      const res = await getCompanyList({ companyName: this.companyName })
      if (res.code === 20000) {
        this.tableData = res.data
      } else {
        this.$message.error('数据获取失败，请联系管理员')
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

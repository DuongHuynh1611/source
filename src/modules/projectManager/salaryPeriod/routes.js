import apiConfig from '@constants/apiConfig';
import SalaryPeriodListPage from '.';
import SalaryPeriodSavePage from './SalaryPeriodSavePage';
import SalaryPeriodDetailListPage from './salaryPeriodDetail';
import SalaryPeriodDetailSavePage from './salaryPeriodDetail/SalaryPeriodDetailSavePage';
import SalaryPeriodDetailLogListPage from './salaryPeriodDetailLog';

export default {
    salaryPeriodListPage: {
        path: '/salary-period',
        title: 'Salary Period',
        auth: true,
        component: SalaryPeriodListPage,
        permissions: [apiConfig.salaryPeriod.getList.baseURL],
    },
    salaryPeriodSavePage: {
        path: '/salary-period/:id',
        title: 'Salary Period Save Page',
        auth: true,
        component: SalaryPeriodSavePage,
        permissions: [apiConfig.salaryPeriod.create.baseURL, apiConfig.salaryPeriod.update.baseURL],
    },
    salaryPeriodDetailListPage: {
        path: '/salary-period/salary-period-detail',
        title: 'Salary Period Detail',
        auth: true,
        component: SalaryPeriodDetailListPage,
        permissions: [apiConfig.salaryPeriodDetail.getList.baseURL],
    },
    salaryPeriodDetailSavePage: {
        path: '/salary-period/salary-period-detail/:id',
        title: 'Salary Period Detail Save Page',
        auth: true,
        component: SalaryPeriodDetailSavePage,
        permissions: [apiConfig.salaryPeriodDetail.create.baseURL],
    },
    salaryPeriodDetailLogListPage: {
        path: '/salary-period/salary-period-detail/log',
        title: 'Salary Period Detail Log',
        auth: true,
        component: SalaryPeriodDetailLogListPage,
        // permissions: [apiConfig.salaryPeriodDetailLog.getList.baseURL],
    },
};

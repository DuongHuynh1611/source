import ListPage from '@components/common/layout/ListPage';
import PageWrapper from '@components/common/layout/PageWrapper';
import {
    DATE_FORMAT_DISPLAY,
    DATE_FORMAT_END_OF_DAY_TIME,
    DATE_FORMAT_ZERO_TIME,
    DEFAULT_FORMAT,
    DEFAULT_TABLE_ITEM_SIZE,
} from '@constants';
import apiConfig from '@constants/apiConfig';
import { TaskLogKindOptions } from '@constants/masterData';
import useListBase from '@hooks/useListBase';
import useTranslate from '@hooks/useTranslate';
import routes from '@routes';
import { Tag } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { defineMessages } from 'react-intl';
import BaseTable from '@components/common/table/BaseTable';
import { commonMessage } from '@locales/intl';
import { FieldTypes } from '@constants/formConfig';
import useFetch from '@hooks/useFetch';
import styles from '../Registration.module.scss';
import useAuth from '@hooks/useAuth';
import { IconAlarm, IconAlarmOff } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { convertUtcToLocalTime, formatDateString, formatDateToEndOfDayTime, formatDateToZeroTime, orderNumber } from '@utils';
import { convertDateTimeToString, convertStringToDateTime } from '@utils/dayHelper';
const message = defineMessages({
    objectName: 'Hoạt động của tôi',
    reminderMessage: 'Vui lòng chọn khoá học !',
    registration: 'Danh sách sinh viên đăng kí khóa học',
});

function StudentActivityCourseListPage() {
    const translate = useTranslate();
    const location = useLocation();
    const queryParameters = new URLSearchParams(window.location.search);
    const courseId = queryParameters.get('courseId');
    const studentId = queryParameters.get('studentId');
    const studentName = queryParameters.get('studentName');
    const fromDate = queryParameters.get('fromDate');
    const toDate = queryParameters.get('toDate');
    const KindTaskLog = translate.formatKeys(TaskLogKindOptions, ['label']);
    const { profile } = useAuth();
    const pathPrev = localStorage.getItem('pathPrev');
    const { data, mixinFuncs, queryFilter, loading, pagination, changePagination, queryParams, serializeParams } =
        useListBase({
            apiConfig: apiConfig.taskLog,
            options: {
                pageSize: DEFAULT_TABLE_ITEM_SIZE,
                objectName: translate.formatMessage(message.objectName),
            },
            override: (funcs) => {
                funcs.mappingData = (response) => {
                    try {
                        if (response.result === true) {
                            return {
                                data: response.data.content,
                                total: response.data.totalElements,
                            };
                        }
                    } catch (error) {
                        return [];
                    }
                };
                funcs.getList = () => {
                    const params = mixinFuncs.prepareGetListParams(queryFilter);
                    mixinFuncs.handleFetchList({ ...params, studentId, courseId, studentName: null });
                };
                funcs.changeFilter = (filter) => {
                    const courseId = queryParams.get('courseId');
                    const studentId = queryParams.get('studentId');
                    const studentName = queryParams.get('studentName');
                    mixinFuncs.setQueryParams(serializeParams({ courseId, studentId, studentName, ...filter }));
                };
                const handleFilterSearchChange = funcs.handleFilterSearchChange;
                funcs.handleFilterSearchChange = (values) => {
                    if (values.toDate == null && values.fromDate == null) {
                        delete values.toDate;
                        delete values.fromDate;
                        handleFilterSearchChange({
                            ...values,
                        });
                    } else if (values.toDate == null) {
                        const fromDate = values.fromDate && formatDateToZeroTime(values.fromDate);
                        delete values.toDate;
                        handleFilterSearchChange({
                            ...values,
                            fromDate: fromDate,
                        });
                    } else if (values.fromDate == null) {
                        const toDate = values.toDate && formatDateToEndOfDayTime(values.toDate);
                        delete values.fromDate;
                        handleFilterSearchChange({
                            ...values,
                            toDate: toDate,
                        });
                    } else {
                        const fromDate = values.fromDate && formatDateToZeroTime(values.fromDate);
                        const toDate = values.toDate && formatDateToEndOfDayTime(values.toDate);
                        handleFilterSearchChange({
                            ...values,
                            fromDate: fromDate,
                            toDate: toDate,
                        });
                    }
                };
            },
        });

    const columns = [
        {
            title: '#',
            dataIndex: 'index',
            key: 'id',
            render: (text, record, index) => {
                return orderNumber(pagination,index);
            },
            width: 50,
        },
        {
            title: translate.formatMessage(commonMessage.createdDate),
            dataIndex: 'createdDate',
            render: (createdDate) => {
                const modifiedDate = convertStringToDateTime(createdDate, DEFAULT_FORMAT, DEFAULT_FORMAT).add(
                    7,
                    'hour',
                );
                const modifiedDateTimeString = convertDateTimeToString(modifiedDate, DEFAULT_FORMAT);
                return <div style={{ padding: '0 4px', fontSize: 14 }}>{modifiedDateTimeString}</div>;
            },
            width: 200,
        },
        {
            title: translate.formatMessage(commonMessage.task),
            dataIndex: ['task', 'lecture', 'lectureName'],
        },
        {
            title: "Khóa học",
            dataIndex: ["task","lecture","subject","subjectName"],
            width: 200,
        },
        {
            title: translate.formatMessage(commonMessage.message),
            dataIndex: 'message',
        },
        {
            title: translate.formatMessage(commonMessage.totalTime),
            dataIndex: 'totalTime',
            align: 'center',
            width: 150,
            render(totalTime) {
                return <div>{Math.ceil((totalTime / 60) * 100) / 100} h</div>;
            },
        },
        {
            title: 'Loại',
            dataIndex: 'kind',
            align: 'center',
            width: 60,
            render(dataRow) {
                const kindLog = KindTaskLog.find((item) => item.value == dataRow);
                return (
                    <Tag color={kindLog.color}>
                        <div style={{ padding: '0 4px', fontSize: 14 }}>{kindLog.label}</div>
                    </Tag>
                );
            },
        },
    ].filter(Boolean);
    const { data: timeSum, execute: executeGetSum } = useFetch(apiConfig.taskLog.getSum, {
        immediate: false,
        params: { courseId, studentId },
        mappingData: ({ data }) => data.content,
    });
    useEffect(() => {
        executeGetSum({
            params: {
                courseId: courseId, startDate: fromDate, endDate: toDate, studentId: studentId,
            },
        });
    }, [courseId, fromDate, toDate, studentId]);
    const searchFields = [
        {
            key: 'fromDate',
            type: FieldTypes.DATE,
            format: DATE_FORMAT_DISPLAY,
            placeholder: translate.formatMessage(commonMessage.fromDate),
            colSpan: 3,
        },
        {
            key: 'toDate',
            type: FieldTypes.DATE,
            format: DATE_FORMAT_DISPLAY,
            placeholder: translate.formatMessage(commonMessage.toDate),
            colSpan: 3,
        },
    ];
    const initialFilterValues = useMemo(() => {
        const initialFilterValues = {
            ...queryFilter,
            fromDate: queryFilter.fromDate && dayjs(formatDateToLocal(queryFilter.fromDate), DEFAULT_FORMAT),
            toDate:
                queryFilter.toDate && dayjs(formatDateToLocal(queryFilter.toDate), DEFAULT_FORMAT),
        };

        return initialFilterValues;
    }, [queryFilter?.fromDate, queryFilter?.toDate]);

    return (
        <PageWrapper
            routes={[
                {
                    breadcrumbName: translate.formatMessage(commonMessage.course),
                    path: routes.courseListPage.path,
                },
                {
                    breadcrumbName: translate.formatMessage(message.registration),
                    path: routes.registrationListPage.path + pathPrev,
                },
                { breadcrumbName: translate.formatMessage(commonMessage.studentActivity) },
            ]}
        >
            <ListPage
                title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                        <span style={{ fontWeight: 'normal' }}>{studentName}</span>
                        <span>
                            <span style={{ marginLeft: '5px' }}>
                                <IconAlarm style={{ marginBottom: '-5px' }} />:{' '}
                                <span style={{ fontWeight: 'bold', fontSize: '17px' }}>
                                    {timeSum && timeSum[0]?.timeWorking
                                        ? Math.ceil((timeSum[0]?.timeWorking / 60) * 10) / 10
                                        : 0}
                                    h{' '}
                                    <span style={{ fontWeight: 'bold', fontSize: '17px', marginLeft: '15px' }}>| </span>
                                </span>
                            </span>
                            <span style={{ marginLeft: '10px' }}>
                                <IconAlarmOff style={{ marginBottom: '-5px', color: 'red' }} />:{' '}
                                <span style={{ fontWeight: 'bold', fontSize: '17px' }}>
                                    {timeSum && timeSum[0]?.timeOff
                                        ? Math.ceil((timeSum[0]?.timeOff / 60) * 10) / 10
                                        : 0}
                                    h
                                </span>
                            </span>
                        </span>
                    </div>
                }
                searchForm={mixinFuncs.renderSearchForm({
                    fields: searchFields,
                    className: styles.search,
                    initialValues: initialFilterValues,
                })}
                baseTable={
                    <div>
                        <BaseTable
                            onChange={changePagination}
                            pagination={pagination}
                            loading={loading}
                            dataSource={data}
                            columns={columns}
                        />
                    </div>
                }
            />
        </PageWrapper>
    );
}


const formatDateToLocal = (date) => {
    return convertUtcToLocalTime(date, DEFAULT_FORMAT, DEFAULT_FORMAT);
};

export default StudentActivityCourseListPage;

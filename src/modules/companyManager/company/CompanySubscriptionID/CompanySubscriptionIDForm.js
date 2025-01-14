import { Card, Col, Row } from 'antd';
import React, { useEffect, useState } from 'react';
import SelectField from '@components/common/form/SelectField';
import useBasicForm from '@hooks/useBasicForm';
import useTranslate from '@hooks/useTranslate';
import { defineMessages } from 'react-intl';
import { BaseForm } from '@components/common/form/BaseForm';
import { FormattedMessage } from 'react-intl';
import apiConfig from '@constants/apiConfig';
import TextField from '@components/common/form/TextField';
import NumericField from '@components/common/form/NumericField';
import { DATE_FORMAT_VALUE, DEFAULT_FORMAT, DEFAULT_FORMAT_ZERO_SECOND } from '@constants';
import { statusOptions } from '@constants/masterData';
import AutoCompleteField from '@components/common/form/AutoCompleteField';
import DatePickerField from '@components/common/form/DatePickerField';
import dayjs from 'dayjs';
import { convertUtcToLocalTime, formatDateString } from '@utils';
import { commonMessage } from '@locales/intl';
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

const CompanySubscriptionIdForm = ({ isEditing, formId, actions, dataDetail, onSubmit, setIsChangedFormValues }) => {
    const translate = useTranslate();
    const statusValues = translate.formatKeys(statusOptions, ['label']);
    const [startDateDefault, setStartDateDefault] = useState();

    const queryParameters = new URLSearchParams(window.location.search);
    const companyId = queryParameters.get('companyId');
    const companyName = queryParameters.get('companyName');

    const { form, mixinFuncs, onValuesChange } = useBasicForm({
        onSubmit,
        setIsChangedFormValues,
    });


    const handleSubmit = (values) => {
        values.startDate = values.startDate && dayjs(values?.startDate).utc().format(DEFAULT_FORMAT);
        values.endDate = values.endDate && dayjs(values?.endDate).utc().format(DEFAULT_FORMAT);
        values.companyId = companyId;
        return mixinFuncs.handleSubmit({ ...values });
    };

    useEffect(() => {
        if (!isEditing > 0) {
            form.setFieldsValue({
                status: statusValues[1].value,
            });
        }
    }, [isEditing]);

    useEffect(() => {
        dataDetail.startDate = dataDetail.startDate && dayjs(convertUtcToLocalTime(dataDetail.startDate, DEFAULT_FORMAT, DEFAULT_FORMAT), DEFAULT_FORMAT_ZERO_SECOND);
        dataDetail.endDate = dataDetail.endDate && dayjs(convertUtcToLocalTime(dataDetail.endDate, DEFAULT_FORMAT, DEFAULT_FORMAT), DEFAULT_FORMAT_ZERO_SECOND);

        form.setFieldsValue({
            ...dataDetail,
            companyName: companyName ? companyName : dataDetail?.company?.companyName,
            serviceCompanySubscriptionId: dataDetail?.subscription?.name,
            startDate: dayjs(formatDateString(new Date(), DEFAULT_FORMAT), DEFAULT_FORMAT),

        });
    }, [dataDetail]);

    const validateDueDate = (_, value) => {
        if(isEditing){
            return Promise.resolve();
        }
        const { startDate } = form.getFieldValue();
        if (startDate && value && value.isBefore(startDate)) {
            return Promise.reject('Ngày kết thúc phải lớn hơn ngày bắt đầu');
        }
        return Promise.resolve();
    };

    const validateStartDate = (_, value) => {
        if(isEditing){
            return Promise.resolve();
        }
        const date = dayjs(formatDateString(new Date(), DEFAULT_FORMAT), DATE_FORMAT_VALUE);
        if (date && value && value.isBefore(date)) {
            return Promise.reject('Ngày bắt đầu phải lớn hơn hoặc bằng ngày hiện tại');
        }
        return Promise.resolve();
    };
    const disabledEndDate = (current) => {
        if (startDateDefault) {
            return current && current.isBefore(startDateDefault.subtract(0, 'day'), 'day');
        }
        return false;
    };

    return (
        <BaseForm
            formId={formId}
            onFinish={handleSubmit}
            form={form} onValuesChange={onValuesChange}
        >
            <Card>
                <Row gutter={16}>
                    <Col span={12}>
                        <AutoCompleteField
                            label={<FormattedMessage defaultMessage="Gói dịch vụ" />}
                            name="serviceCompanySubscriptionId"
                            apiConfig={apiConfig.serviceCompanySubscription.autocomplete}
                            mappingOptions={(item) => ({ value: item.id, label: item.name })}
                            initialSearchParams={{}}
                            searchParams={(text) => ({ name: text })}
                            required
                            disabled={isEditing}

                        />
                    </Col>
                    <Col span={12}>
                        <TextField
                            label={<FormattedMessage defaultMessage="Công ty" />}
                            name="companyName"
                            disabled
                        />
                    </Col>
                    <Col span={12}>
                        <DatePickerField
                            showTime={true}
                            name="startDate"
                            label={translate.formatMessage(commonMessage.startDate)}
                            placeholder="Ngày bắt đầu"
                            onChange={(value) => {
                                setStartDateDefault(value);
                            }}
                            format={DEFAULT_FORMAT}
                            style={{ width: '100%' }}
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng chọn ngày bắt đầu',
                                },
                                {
                                    validator: validateStartDate,
                                },
                            ]}
                        />
                    </Col>
                    <Col span={12}>
                        <DatePickerField
                            showTime={true}
                            label={<FormattedMessage defaultMessage="Ngày kết thúc" />}
                            name="endDate"
                            placeholder="Ngày kết thúc"
                            disabledDate={disabledEndDate}
                            dependencies={['startDate']}

                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng chọn ngày kết thúc',
                                },
                                {
                                    validator: validateDueDate,
                                },
                            ]}
                            format={DEFAULT_FORMAT}
                            style={{ width: '100%' }}
                        />
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <SelectField
                            label={<FormattedMessage defaultMessage="Trạng thái" />}
                            name="status"
                            options={statusValues}
                        />
                    </Col>
                    <Col span={12}>
                        <NumericField
                            label={<FormattedMessage defaultMessage="Giảm giá" />}
                            name="saleOff"
                            min={0}
                            max={100}
                            formatter={(value) => `${value}%`}
                            parser={(value) => value.replace('%', '')}
                        />
                    </Col>
                </Row>
                <div className="footer-card-form">{actions}</div>
            </Card>
        </BaseForm>
    );
};

export default CompanySubscriptionIdForm;

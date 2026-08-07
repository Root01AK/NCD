<?php

namespace app\models;

use Yii;
use yii\base\Model;
use yii\data\ActiveDataProvider;
use app\models\Settings;

/**
 * SettingsSearch represents the model behind the search form about `app\models\Settings`.
 */
class SettingsSearch extends Settings
{
    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['stngs_id', 'smtp_server_port', 'stngs_pagesize', 'stngs_incendv_amt', 'stngs_financial_year', 'create_time', 'create_user', 'update_time', 'update_user'], 'integer'],
            [['stngs_app_name', 'stngs_org_logo', 'stngs_org_name', 'stngs_org_addrs', 'stngs_org_phone', 'stngs_org_mail', 'stngs_org_website', 'smtp_admin_name', 'smtp_frm_mail', 'smtp_server_name', 'smtp_server_usrname', 'smtp_server_pwd', 'smtp_server_ssl', 'smtp_server_auth', 'stngs_timezone', 'stngs_dateformat', 'stngs_location', 'stngs_survey_code', 'stngs_survey_fixed', 'status'], 'safe'],
        ];
    }

    /**
     * @inheritdoc
     */
    public function scenarios()
    {
        // bypass scenarios() implementation in the parent class
        return Model::scenarios();
    }

    /**
     * Creates data provider instance with search query applied
     *
     * @param array $params
     *
     * @return ActiveDataProvider
     */
    public function search($params)
    {
        $query = Settings::find();

        // add conditions that should always apply here

        $dataProvider = new ActiveDataProvider([
            'query' => $query,
        ]);

        $this->load($params);

        if (!$this->validate()) {
            // uncomment the following line if you do not want to return any records when validation fails
            // $query->where('0=1');
            return $dataProvider;
        }

        // grid filtering conditions
        $query->andFilterWhere([
            'stngs_id' => $this->stngs_id,
            'smtp_server_port' => $this->smtp_server_port,
            'stngs_pagesize' => $this->stngs_pagesize,
            'stngs_incendv_amt' => $this->stngs_incendv_amt,
            'stngs_financial_year' => $this->stngs_financial_year,
            'create_time' => $this->create_time,
            'create_user' => $this->create_user,
            'update_time' => $this->update_time,
            'update_user' => $this->update_user,
        ]);

        $query->andFilterWhere(['like', 'stngs_app_name', $this->stngs_app_name])
            ->andFilterWhere(['like', 'stngs_org_logo', $this->stngs_org_logo])
            ->andFilterWhere(['like', 'stngs_org_name', $this->stngs_org_name])
            ->andFilterWhere(['like', 'stngs_org_addrs', $this->stngs_org_addrs])
            ->andFilterWhere(['like', 'stngs_org_phone', $this->stngs_org_phone])
            ->andFilterWhere(['like', 'stngs_org_mail', $this->stngs_org_mail])
            ->andFilterWhere(['like', 'stngs_org_website', $this->stngs_org_website])
            ->andFilterWhere(['like', 'smtp_admin_name', $this->smtp_admin_name])
            ->andFilterWhere(['like', 'smtp_frm_mail', $this->smtp_frm_mail])
            ->andFilterWhere(['like', 'smtp_server_name', $this->smtp_server_name])
            ->andFilterWhere(['like', 'smtp_server_usrname', $this->smtp_server_usrname])
            ->andFilterWhere(['like', 'smtp_server_pwd', $this->smtp_server_pwd])
            ->andFilterWhere(['like', 'smtp_server_ssl', $this->smtp_server_ssl])
            ->andFilterWhere(['like', 'smtp_server_auth', $this->smtp_server_auth])
            ->andFilterWhere(['like', 'stngs_timezone', $this->stngs_timezone])
            ->andFilterWhere(['like', 'stngs_dateformat', $this->stngs_dateformat])
            ->andFilterWhere(['like', 'stngs_location', $this->stngs_location])
            ->andFilterWhere(['like', 'stngs_survey_code', $this->stngs_survey_code])
            ->andFilterWhere(['like', 'stngs_survey_fixed', $this->stngs_survey_fixed])
            ->andFilterWhere(['like', 'status', $this->status]);

        return $dataProvider;
    }
}

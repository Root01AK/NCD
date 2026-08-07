<?php

namespace app\models;

use Yii;
use yii\base\Model;
use yii\data\ActiveDataProvider;
use app\models\Applicationsettings;

/**
 * ApplicationsettingsSearch represents the model behind the search form about `app\models\Applicationsettings`.
 */
class ApplicationsettingsSearch extends Applicationsettings
{
    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['app_stngs_id', 'create_user', 'update_user'], 'integer'],
            [['app_survey_id', 'app_coupons', 'app_incentive', 'app_control_site','app_idu','app_fin_yr', 'app_fin_yr_fixed', 'app_reimbsmnt_vchr', 'app_reimbsmnt_vchr_fixed', 'app_location', 'app_location_fixed', 'app_cupn_cde_fixed', 'app_no_of_coupon', 'app_no_of_coupon_fixed', 'app_cupn_prd', 'app_cupn_prd_type', 'app_cupn_prd_fixed', 'app_incentive_amt', 'app_incentive_amt_fixed', 'app_incentive_vchr', 'app_incentive_vchr_fixed','app_ost_fixed', 'status', 'create_time', 'update_time'], 'safe'],
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
        $query = Applicationsettings::find();

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
            'app_stngs_id' => $this->app_stngs_id,
			'app_coupons' => $this->app_coupons,
			'app_incentive' => $this->app_incentive,
			'app_control_site' => $this->app_control_site,
			'app_ost_fixed' => $this->app_ost_fixed,
			'app_idu' => $this->app_idu,
            'create_time' => $this->create_time,
            'create_user' => $this->create_user,
            'update_time' => $this->update_time,
            'update_user' => $this->update_user,
        ]);

        $query->andFilterWhere(['like', 'app_survey_id', $this->app_survey_id])            
            ->andFilterWhere(['like', 'app_fin_yr', $this->app_fin_yr])
            ->andFilterWhere(['like', 'app_fin_yr_fixed', $this->app_fin_yr_fixed])
            ->andFilterWhere(['like', 'app_reimbsmnt_vchr', $this->app_reimbsmnt_vchr])
            ->andFilterWhere(['like', 'app_reimbsmnt_vchr_fixed', $this->app_reimbsmnt_vchr_fixed])
            ->andFilterWhere(['like', 'app_location', $this->app_location])
            ->andFilterWhere(['like', 'app_location_fixed', $this->app_location_fixed])
            ->andFilterWhere(['like', 'app_cupn_cde_fixed', $this->app_cupn_cde_fixed])
            ->andFilterWhere(['like', 'app_no_of_coupon', $this->app_no_of_coupon])
            ->andFilterWhere(['like', 'app_no_of_coupon_fixed', $this->app_no_of_coupon_fixed])
            ->andFilterWhere(['like', 'app_cupn_prd', $this->app_cupn_prd])
            ->andFilterWhere(['like', 'app_cupn_prd_type', $this->app_cupn_prd_type])
            ->andFilterWhere(['like', 'app_cupn_prd_fixed', $this->app_cupn_prd_fixed])
            ->andFilterWhere(['like', 'app_incentive_amt', $this->app_incentive_amt])
            ->andFilterWhere(['like', 'app_incentive_amt_fixed', $this->app_incentive_amt_fixed])
            ->andFilterWhere(['like', 'app_incentive_vchr', $this->app_incentive_vchr])
            ->andFilterWhere(['like', 'app_incentive_vchr_fixed', $this->app_incentive_vchr_fixed])
            ->andFilterWhere(['like', 'status', $this->status]);

        return $dataProvider;
    }
}

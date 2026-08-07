<?php
	use app\base\Currency;
	use app\base\Converter;
	use yii\web\View;
	use yii\web\JqueryAsset;
	$this->registerAssetBundle(JqueryAsset::className());

    if(is_array($model))
        $model = (object)$model;
    $pid = $model->pid;
    $vno = $model->vno;
    $vdt = $model->vdt;
    $amt = $model->amt;
    $summary = $model->summary;
?>
<!DOCTYPE html>
<html lang="<?= Yii::$app->language ?>">
<head>
<script language="javascript">
	function print_box()
	{
		$("#print_box").hide();
        $("#prnt_copy").html($(".table").html());
		if(window.print())
		{
			window.self.close();
		}
		else
		{
			$("#print_box").show();
		}
        $("#prnt_copy").html("");
	}
</script>
<style>
    table .question_title{
        float: none;
    }
    table .question{
        float: none;
        width: 0px;
    }
    .table {
        font-size: 11px;
        border-right: 1px solid #AAAAAA;
        border-bottom: 1px solid #AAAAAA;
		line-height: 20px;
    }
    .table th, .table td {
        border-left: 1px solid #AAAAAA;
        border-top: 1px solid #AAAAAA;
    }
</style>
</head>
<body>
<br/><br/><br/>
<table border="0" cellpadding="0" cellspacing="0" width="90%" align="center" class="table">
    <tr>
        <th>
            <img src="../images/logo.jpg" style="height: 75px; padding-top: 5px;" />
        </th>
        <th>
            <span style="font-size: 15px;">Y.R.Gaitonde Centre for AIDS Research and Education </span><br/>
            <span style="font-weight: normal;">VHS Campus, Rajiv Gandhi Road, Taramani, Chennai 600113 India.</span>
        </th>
    </tr>
    <tr>
        <th colspan="2" style="font-size: 14px;"><strong>ICCPLUS</strong></th>
    </tr>
    <tr>
        <th colspan="2" style="font-size: 12px;"><strong><?= $summary ?> Voucher</strong></th>
    </tr>
    <tr>
        <td colspan="2">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" align="center" style="margin-top: -1px; margin-left: -1px; border: 0px;">
                <tr>
                    <td width="15%" style="border: 0px; padding-left: 3px;"><strong>Particpant ID</strong></td>
                    <td width="15%" style="border: 0px;">
                        <?php echo $pid; ?>
                    </td>
                    <td width="40%" style="border: 0px;">&nbsp;</td>
                    <td width="15%" style="border: 0px;"><strong>Voucher No</strong></td>
                    <td width="15%" style="border: 0px;">
                        <?php echo $vno; ?>
                    </td>
                </tr>
                <tr>
                    <td style="border: 0px;" colspan="3"></td>
                    <td style="border: 0px;"><strong>Voucher Date</strong></td>
                    <td style="border: 0px;">
                        <?php echo Converter::toDisplay($vdt); ?>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
    <tr>
        <td colspan="2" style="border: 0px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" align="center" style="border: 0px;">
                <tr>
                    <th width="10%" style="font-size: 13px;">S. No</th>
                    <th width="75%" style="font-size: 13px;">&nbsp;</th>
                    <th width="15%" style="font-size: 13px;">Amount</th>
                </tr>
				<tr>
					<td style="text-align: center;">1.</td>
					<td style="padding-left: 3px;"><?= $summary; ?></td>
					<td style="text-align: right; padding-right: 3px;">
						<?php echo number_format($amt, 2, '.', ','); ?>
					</td>
				</tr>
            </table>
        </td>
    </tr>
    <tr>
        <td colspan="2" style="border: 0px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" align="center" class="table" style="border: 0px;">
                <tr>
                    <td width="70%" style="padding-left: 3px; vertical-align: top; height: 50px;">
                        <strong>Amount in Words: </strong>
                        <?php echo Currency::number_to_words($amt).' Only'; ?>
                    </td>
                    <th width="15%" style="font-size: 13px;"><strong>Total</strong></th>
                    <td width="15%" style="font-size: 13px; text-align: right; padding-right: 3px;">
                        <strong><?php echo number_format($amt, 2, '.', ','); ?></strong>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
    <tr>
        <td colspan="2">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" align="center" style="margin-top: -1px; margin-left: -1px; border: 0px;">
                <tr>
                    <td colspan="5" style="height: 50px;">&nbsp;</td>
                </tr>
                <tr>
                    <td width="15%" style="border: 0px; padding-left: 3px;"><strong>Received By</strong></td>
                    <td width="15%" style="border: 0px;">&nbsp;</td>
                    <td width="30%" style="border: 0px;">&nbsp;</td>
                    <td width="20%" style="border: 0px;"><strong>Authorised Signatory</strong></td>
                    <td width="15%" style="border: 0px;">&nbsp;</td>
                </tr>
                <tr>
                    <td style="border: 0px; padding-left: 3px;"><strong>Received Date</strong></td>
                    <td style="border: 0px;" colspan="2"></td>
                    <td style="border: 0px;"><strong>Issued Date</strong></td>
                    <td style="border: 0px;"><?php echo str_replace("%", "", date("d-m-Y")); ?></td>
                </tr>
            </table>
        </td>
    </tr>
    <tr id="print_box">
        <th colspan="2" style="height: 50px;">
            <input type="button" name="print" value="Print" onclick="return print_box();" />
            &nbsp;&nbsp;&nbsp;
            <input type="button" name="close" value="Close" onclick="Javascript: window.self.close();" />
        </th>
    </tr>
</table>
<br/><br/><br/><br/><br/><br/>
<table border="0" cellpadding="0" cellspacing="0" width="90%" align="center" class="table" id="prnt_copy"></table>
<?php $this->endBody() ?>
</body>
</html>
<?php $this->endPage() ?>
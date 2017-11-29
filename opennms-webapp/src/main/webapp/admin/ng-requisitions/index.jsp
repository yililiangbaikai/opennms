<%--
/*******************************************************************************
 * This file is part of OpenNMS(R).
 *
 * Copyright (C) 2015 The OpenNMS Group, Inc.
 * OpenNMS(R) is Copyright (C) 1999-2015 The OpenNMS Group, Inc.
 *
 * OpenNMS(R) is a registered trademark of The OpenNMS Group, Inc.
 *
 * OpenNMS(R) is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published
 * by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * OpenNMS(R) is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with OpenNMS(R).  If not, see:
 *      http://www.gnu.org/licenses/
 *
 * For more information contact:
 *     OpenNMS(R) Licensing <license@opennms.org>
 *     http://www.opennms.org/
 *     http://www.opennms.com/
 *******************************************************************************/
--%>

<%@ page contentType="text/html;charset=UTF-8" language="java" %>

<jsp:include page="/includes/bootstrap.jsp" flush="false">
    <jsp:param name="norequirejs" value="true" />
    <jsp:param name="nobreadcrumbs" value="true" />
    <jsp:param name="ngapp" value="onms-requisitions" />
    <jsp:param name="title" value="Manage Provisioning Requisitions" />
    <jsp:param name="headTitle" value="Provisioning Requisitions" />
    <jsp:param name="headTitle" value="Admin" />
    <jsp:param name="location" value="admin" />

    <jsp:param name="script" value='<script type="text/javascript" src="js/angular.min.js"></script>' />
    <jsp:param name="script" value='<script type="text/javascript" src="lib/ip-address/dist/ip-address-globals.js"></script>' />
    <jsp:param name="script" value='<script type="text/javascript" src="lib/bootbox/bootbox.js"></script>' />

    <jsp:param name="script" value='<script type="text/javascript" src="js/onms-requisitions/app-requisitions.js"></script>' />
    <jsp:param name="script" value='<script type="text/javascript" src="js/onms-requisitions/scripts/model/RequisitionInterface.js"></script>' />
    <jsp:param name="script" value='<script type="text/javascript" src="js/onms-requisitions/scripts/model/RequisitionNode.js"></script>' />
    <jsp:param name="script" value='<script type="text/javascript" src="js/onms-requisitions/scripts/model/Requisition.js"></script>' />
    <jsp:param name="script" value='<script type="text/javascript" src="js/onms-requisitions/scripts/model/RequisitionsData.js"></script>' />
    <jsp:param name="script" value='<script type="text/javascript" src="js/onms-requisitions/scripts/model/QuickNode.js"></script>' />
    <jsp:param name="script" value='<script type="text/javascript" src="js/onms-requisitions/scripts/services/Requisitions.js"></script>' />
    <jsp:param name="script" value='<script type="text/javascript" src="js/onms-requisitions/scripts/services/Synchronize.js"></script>' />
    <jsp:param name="script" value='<script type="text/javascript" src="js/onms-requisitions/scripts/filters/startFrom.js"></script>' />
    <jsp:param name="script" value='<script type="text/javascript" src="js/onms-requisitions/scripts/directives/requisitionConstraints.js"></script>' />
    <jsp:param name="script" value='<script type="text/javascript" src="js/onms-requisitions/scripts/controllers/Move.js"></script>' />
    <jsp:param name="script" value='<script type="text/javascript" src="js/onms-requisitions/scripts/controllers/QuickAddNode.js"></script>' />
    <jsp:param name="script" value='<script type="text/javascript" src="js/onms-requisitions/scripts/controllers/QuickAddNodeModal.js"></script>' />
    <jsp:param name="script" value='<script type="text/javascript" src="js/onms-requisitions/scripts/controllers/CloneForeignSource.js"></script>' />
    <jsp:param name="script" value='<script type="text/javascript" src="js/onms-requisitions/scripts/controllers/Detector.js"></script>' />
    <jsp:param name="script" value='<script type="text/javascript" src="js/onms-requisitions/scripts/controllers/Policy.js"></script>' />
    <jsp:param name="script" value='<script type="text/javascript" src="js/onms-requisitions/scripts/controllers/ForeignSource.js"></script>' />
    <jsp:param name="script" value='<script type="text/javascript" src="js/onms-requisitions/scripts/controllers/Asset.js"></script>' />
    <jsp:param name="script" value='<script type="text/javascript" src="js/onms-requisitions/scripts/controllers/Interface.js"></script>' />
    <jsp:param name="script" value='<script type="text/javascript" src="js/onms-requisitions/scripts/controllers/Node.js"></script>' />
    <jsp:param name="script" value='<script type="text/javascript" src="js/onms-requisitions/scripts/controllers/Requisition.js"></script>' />
    <jsp:param name="script" value='<script type="text/javascript" src="js/onms-requisitions/scripts/controllers/Requisitions.js"></script>' />
</jsp:include>

<div ng-view></div>
<div growl></div>

<jsp:include page="/includes/bootstrap-footer.jsp" flush="false"/>

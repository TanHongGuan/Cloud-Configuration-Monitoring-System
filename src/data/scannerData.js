import cloudtrailTrails from "../../cloudConfigCheck/data/sample_cloudtrail.json";
import iamUsers from "../../cloudConfigCheck/data/sample_iam_users.json";
import lambdaFunctions from "../../cloudConfigCheck/data/sample_lambda_functions.json";
import publicEndpoints from "../../cloudConfigCheck/data/sample_public_endpoints.json";
import rdsDatabases from "../../cloudConfigCheck/data/sample_rds_databases.json";
import s3Buckets from "../../cloudConfigCheck/data/sample_s3_buckets.json";
import securityGroups from "../../cloudConfigCheck/data/sample_security_groups.json";

function baseFinding(resource, area, rule, status, severity, findingType, details) {
  return {
    resourceId: resource.resource_id,
    resourceName: resource.resource_name,
    resourceType: resource.resource_type,
    projectId: "imaginehack",
    projectName: "imagineHack",
    caseType: resource.case_type,
    service: area,
    rule,
    status,
    severity,
    findingType,
    title: details.title,
    risk: details.risk,
    situation: details.reason,
    awsPart: details.awsPart,
    recommendedAction: details.managerRecommendation,
    technicianRecommendation: details.technicianRecommendation,
  };
}

function checkS3Bucket(bucket) {
  const isPublic =
    bucket.public_access_blocked === false ||
    bucket.bucket_policy_public === true ||
    bucket.acl_public === true;

  if (isPublic) {
    return baseFinding(bucket, "S3", "S3 buckets must meet the professional security baseline", "FAILED", "HIGH", "Danger", {
      title: "Cloud storage may be publicly accessible",
      awsPart: "S3 cloud storage access settings",
      reason: "A cloud storage location may be accessible from the public internet.",
      risk: "Internal files, documents, or operational records may be viewed by people outside the company.",
      managerRecommendation:
        "Ask the IT or cloud team to immediately block public access to this storage location and confirm that only approved users or systems can access it.",
      technicianRecommendation: [
        "Open AWS Console and go to S3.",
        "Search for and select the bucket shown in the resource ID.",
        "Go to the Permissions tab.",
        "Enable Block Public Access for this bucket.",
        "Review the bucket policy and remove any public access.",
        "Enable default server-side encryption.",
      ],
    });
  }

  if (bucket.encryption_enabled === false) {
    return baseFinding(bucket, "S3", "S3 buckets must meet the professional security baseline", "FLAGGED", "MEDIUM", "Warning", {
      title: "Cloud storage needs encryption",
      awsPart: "S3 cloud storage encryption settings",
      reason: "This cloud storage location is not open to the public, but its files are not protected with encryption.",
      risk: "If someone gains access to this storage location, stored files may be easier to read because encryption is not enabled.",
      managerRecommendation:
        "Ask the IT or cloud team to enable encryption for this storage location. This is not an emergency exposure, but it should be fixed to meet the company security baseline.",
      technicianRecommendation: [
        "Open AWS Console and go to S3.",
        "Search for and select the bucket shown in the resource ID.",
        "Go to the Properties tab.",
        "Enable default server-side encryption.",
      ],
    });
  }

  return null;
}

function checkSecurityGroup(group) {
  const sshRules = group.inbound_rules.filter(
    (rule) => rule.protocol === "tcp" && rule.port === 22
  );
  const openSsh = sshRules.some((rule) => rule.source === "0.0.0.0/0");
  const restrictedSsh = sshRules.some((rule) => rule.source !== "0.0.0.0/0");

  if (openSsh) {
    return baseFinding(group, "EC2", "SSH must not be open to 0.0.0.0/0", "FAILED", "HIGH", "Danger", {
      title: "Server admin access may be exposed online",
      awsPart: "Server firewall access settings",
      reason: "A server may allow administrator access from the public internet.",
      risk: "People outside the company may be able to attempt remote access to this server, increasing the risk of unauthorised control.",
      managerRecommendation:
        "Ask the IT or cloud team to immediately block public admin access to this server. Admin access should only be allowed through approved secure methods.",
      technicianRecommendation: [
        "Open AWS Console and go to EC2.",
        "Open Security Groups.",
        "Select the security group shown in the resource ID.",
        "Delete the TCP port 22 rule from 0.0.0.0/0.",
        "Use a VPN, bastion host, or Session Manager for admin access.",
      ],
    });
  }

  if (restrictedSsh) {
    return baseFinding(group, "EC2", "SSH must not be open to 0.0.0.0/0", "FLAGGED", "MEDIUM", "Warning", {
      title: "Server access needs review",
      awsPart: "Server firewall access settings",
      reason: "Server administration access is allowed only from a restricted network, but it should still be reviewed.",
      risk: "The server is not open to everyone, but admin access should be checked to confirm it is approved, still needed, and limited to trusted networks.",
      managerRecommendation:
        "Ask the IT or cloud team to confirm whether this server admin access is still required. If it is not needed, remove it.",
      technicianRecommendation: [
        "Open AWS Console and go to EC2.",
        "Open Security Groups.",
        "Review the SSH source IP range.",
        "Remove the rule if it is no longer required.",
      ],
    });
  }

  return null;
}

function checkIamUser(user) {
  const hasAdminAccess = user.attached_policies.includes("AdministratorAccess");
  const oldOrUnusedKey = user.access_key_age_days > 90 || user.access_key_last_used_days_ago > 90;

  if (hasAdminAccess && user.is_admin_user === false) {
    return baseFinding(user, "IAM", "Non-admin users must not have AdministratorAccess", "FAILED", "HIGH", "Danger", {
      title: "User has excessive cloud permissions",
      awsPart: "IAM user permission settings",
      reason: "A user account has administrator-level cloud access even though it is not meant to be an admin user.",
      risk: "This user may be able to change, delete, or access critical AWS resources beyond their job responsibility.",
      managerRecommendation:
        "Ask the cloud or IT team to immediately review and reduce this user's permissions. The user should only have the access required for their role.",
      technicianRecommendation: [
        "Open AWS Console and go to IAM.",
        "Select the IAM user shown in the resource ID.",
        "Remove AdministratorAccess.",
        "Attach least-privilege permissions for the user's role.",
      ],
    });
  }

  if (oldOrUnusedKey) {
    return baseFinding(user, "IAM", "Old or unused access keys should be flagged", "FLAGGED", "MEDIUM", "Warning", {
      title: "Access key needs review",
      awsPart: "IAM access key settings",
      reason: "A user's access key is old or has not been used recently.",
      risk: "Old or unused access keys increase the risk of forgotten credentials being exposed or misused.",
      managerRecommendation:
        "Ask the cloud or IT team to review this access key. If it is still needed, rotate it. If it is no longer needed, remove it.",
      technicianRecommendation: [
        "Open AWS Console and go to IAM.",
        "Select the IAM user shown in the resource ID.",
        "Open Security credentials.",
        "Rotate or remove old and unused access keys.",
      ],
    });
  }

  return null;
}

function checkRdsDatabase(database) {
  if (database.publicly_accessible) {
    return baseFinding(database, "RDS", "Databases must not be publicly accessible", "FAILED", "HIGH", "Danger", {
      title: "Database may be publicly reachable",
      awsPart: "RDS database public access settings",
      reason: "A cloud database may be reachable from the public internet.",
      risk: "Internal database records could be exposed or targeted by people outside the company.",
      managerRecommendation:
        "Ask the IT or cloud team to immediately make this database private. The database should only be reachable by approved internal applications or systems.",
      technicianRecommendation: [
        "Open AWS Console and go to RDS.",
        "Select the database shown in the resource ID.",
        "Disable Publicly Accessible.",
        "Place the database in private subnets.",
        "Restrict access through security groups.",
      ],
    });
  }

  if (database.encryption_enabled === false || database.backup_enabled === false) {
    return baseFinding(database, "RDS", "RDS databases should meet the professional security baseline", "FLAGGED", "MEDIUM", "Warning", {
      title: "Database protection needs review",
      awsPart: "RDS database protection settings",
      reason: "The database is private, but encryption or automated backups are missing.",
      risk: "The database is not publicly exposed, but stored company data is not fully protected according to the expected baseline.",
      managerRecommendation:
        "Ask the IT or cloud team to review this database protection setup. Encryption and backup settings should meet the company security baseline.",
      technicianRecommendation: [
        "Open AWS Console and go to RDS.",
        "Select the database shown in the resource ID.",
        "Enable storage encryption where supported.",
        "Enable automated backups with an appropriate retention period.",
      ],
    });
  }

  return null;
}

function checkCloudTrail(trail) {
  if (trail.logging_enabled === false) {
    return baseFinding(trail, "CloudTrail", "CloudTrail logging must be enabled", "FAILED", "HIGH", "Danger", {
      title: "Cloud activity logging is disabled",
      awsPart: "CloudTrail audit logging settings",
      reason: "Cloud activity logging is turned off.",
      risk: "The company may not have a reliable record of who changed cloud resources, when changes happened, or what actions were taken.",
      managerRecommendation:
        "Ask the IT or cloud team to enable cloud activity logging immediately. This is important for investigation, accountability, and detecting unauthorised changes.",
      technicianRecommendation: [
        "Open AWS Console and go to CloudTrail.",
        "Select the trail shown in the resource ID.",
        "Enable logging.",
        "Enable multi-region logging and log file validation.",
      ],
    });
  }

  if (trail.multi_region_enabled === false || trail.log_file_validation_enabled === false) {
    return baseFinding(trail, "CloudTrail", "CloudTrail should meet the professional audit logging baseline", "FLAGGED", "MEDIUM", "Warning", {
      title: "Audit logging setup needs review",
      awsPart: "CloudTrail audit logging settings",
      reason: "Cloud activity is being recorded, but the audit logging setup is incomplete.",
      risk: "The company may have less visibility when investigating who changed cloud resources or when changes happened.",
      managerRecommendation:
        "Ask the IT or cloud team to improve the audit logging setup so cloud changes can be monitored more reliably.",
      technicianRecommendation: [
        "Open AWS Console and go to CloudTrail.",
        "Select the trail shown in the resource ID.",
        "Enable multi-region logging.",
        "Enable log file validation.",
      ],
    });
  }

  return null;
}

function checkPublicEndpoint(endpoint) {
  if (endpoint.https_enabled === false) {
    return baseFinding(endpoint, "Public Endpoint", "Public endpoints must enforce HTTPS and have logging enabled", "FAILED", "HIGH", "Danger", {
      title: "Public endpoint does not enforce HTTPS",
      awsPart: "Public website or API security settings",
      reason: "A public-facing website or API endpoint does not enforce HTTPS.",
      risk: "Data sent between users and the public endpoint may not be properly protected in transit.",
      managerRecommendation:
        "Ask the IT or cloud team to immediately enforce HTTPS for this public endpoint.",
      technicianRecommendation: [
        "Open AWS Console and go to CloudFront or API Gateway.",
        "Select the distribution or API shown in the resource ID.",
        "Enforce HTTPS-only access or redirect HTTP to HTTPS.",
        "Verify a valid TLS certificate is attached.",
      ],
    });
  }

  if (endpoint.logging_enabled === false) {
    return baseFinding(endpoint, "Public Endpoint", "Public endpoints must enforce HTTPS and have logging enabled", "FLAGGED", "MEDIUM", "Warning", {
      title: "Public endpoint logging is missing",
      awsPart: "Public website or API logging settings",
      reason: "The public endpoint uses HTTPS, but activity logging is disabled.",
      risk: "Suspicious or unexpected access may be harder to investigate because activity is not being recorded.",
      managerRecommendation:
        "Ask the IT or cloud team to enable logging for this public endpoint so unusual activity can be investigated.",
      technicianRecommendation: [
        "Open AWS Console and go to API Gateway or CloudFront.",
        "Select the API or distribution shown in the resource ID.",
        "Enable access logging.",
        "Send logs to CloudWatch Logs or another approved destination.",
      ],
    });
  }

  return null;
}

function checkLambdaFunction(fn) {
  if (fn.has_admin_access) {
    return baseFinding(fn, "Lambda", "Function roles should follow least privilege", "FAILED", "HIGH", "Danger", {
      title: "Serverless function has excessive permissions",
      awsPart: "Lambda function role permission settings",
      reason: "A serverless function has administrator-level cloud permissions.",
      risk: "If this small function is misused or compromised, it may be able to access or change critical AWS resources.",
      managerRecommendation:
        "Ask the cloud or IT team to immediately reduce this function's permissions. The function should only have the access required to perform its specific task.",
      technicianRecommendation: [
        "Open AWS Console and go to Lambda.",
        "Select the Lambda function shown in the resource ID.",
        "Open the execution role in IAM.",
        "Remove AdministratorAccess.",
        "Attach least-privilege permissions.",
      ],
    });
  }

  if (fn.has_wildcard_permissions) {
    return baseFinding(fn, "Lambda", "Function roles should follow least privilege", "FLAGGED", "MEDIUM", "Warning", {
      title: "Serverless permissions need review",
      awsPart: "Lambda function role permission settings",
      reason: "A serverless function has broader cloud permissions than it likely needs.",
      risk: "The function does not have full administrator access, but its permissions may still be wider than necessary.",
      managerRecommendation:
        "Ask the cloud or IT team to review whether this function really needs these permissions. Unnecessary broad permissions should be replaced with more specific access.",
      technicianRecommendation: [
        "Open AWS Console and go to Lambda.",
        "Select the Lambda function shown in the resource ID.",
        "Open the execution role in IAM.",
        "Replace broad permissions with a narrower custom policy.",
      ],
    });
  }

  return null;
}

export function scanCloudConfigurations() {
  return [
    ...s3Buckets.map(checkS3Bucket),
    ...securityGroups.map(checkSecurityGroup),
    ...iamUsers.map(checkIamUser),
    ...rdsDatabases.map(checkRdsDatabase),
    ...cloudtrailTrails.map(checkCloudTrail),
    ...publicEndpoints.map(checkPublicEndpoint),
    ...lambdaFunctions.map(checkLambdaFunction),
  ]
    .filter(Boolean)
    .map((finding) => ({
      id: `${finding.resourceName}-${finding.severity.toLowerCase()}`,
      projectId: finding.projectId,
      severity: finding.findingType,
      title: finding.title,
      risk: finding.risk,
      situation: finding.situation,
      awsPart: finding.awsPart,
      recommendedAction: finding.recommendedAction,
      technicianRecommendation: finding.technicianRecommendation,
      resourceId: finding.resourceId,
      resourceName: finding.resourceName,
      resourceType: finding.resourceType,
      rule: finding.rule,
      status: finding.status,
      service: finding.service,
    }));
}

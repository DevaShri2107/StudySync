import 'dart:typed_data';
import 'package:googleapis/drive/v3.dart' as drive;
import 'google_auth_service.dart';

class GoogleDriveService {
  static const String rootFolderName = 'StudySync_College_Files';

  // Get or create dedicated StudySync root folder
  static Future<String> _getOrCreateFolder(drive.DriveApi driveApi, String folderName, [String? parentId]) async {
    final q = parentId != null
        ? "mimeType = 'application/vnd.google-apps.folder' and name = '$folderName' and '$parentId' in parents and trashed = false"
        : "mimeType = 'application/vnd.google-apps.folder' and name = '$folderName' and trashed = false";

    final fileList = await driveApi.files.list(q: q, spaces: 'drive', $fields: 'files(id, name)');
    if (fileList.files != null && fileList.files!.isNotEmpty) {
      return fileList.files!.first.id!;
    }

    // Create folder
    final folderMetadata = drive.File()
      ..name = folderName
      ..mimeType = 'application/vnd.google-apps.folder';

    if (parentId != null) {
      folderMetadata.parents = [parentId];
    }

    final folder = await driveApi.files.create(folderMetadata, $fields: 'id');
    return folder.id!;
  }

  // Upload file to Google Drive using official Drive API v3
  static Future<Map<String, String>> uploadFile({
    required String fileName,
    required Uint8List fileBytes,
    required String mimeType,
    required String subFolderName, // 'Assignments', 'Submissions', 'Notes'
  }) async {
    final client = await GoogleAuthService.getAuthenticatedClient();
    if (client == null) {
      throw Exception('Google Drive is not connected. Please connect Google Account in Connected Services.');
    }

    final driveApi = drive.DriveApi(client);

    // Root folder -> Subfolder
    final rootId = await _getOrCreateFolder(driveApi, rootFolderName);
    final folderId = await _getOrCreateFolder(driveApi, subFolderName, rootId);

    // File metadata
    final driveFile = drive.File()
      ..name = fileName
      ..parents = [folderId];

    final media = drive.Media(
      Stream.value(fileBytes),
      fileBytes.length,
      contentType: mimeType,
    );

    // Upload
    final uploadedFile = await driveApi.files.create(
      driveFile,
      uploadMedia: media,
      $fields: 'id, webViewLink, webContentLink',
    );

    // Make viewable to anyone with link for academic reading
    try {
      final permission = drive.Permission()
        ..role = 'reader'
        ..type = 'anyone';
      await driveApi.permissions.create(permission, uploadedFile.id!);
    } catch (_) {
      // ignore if restricted by workspace policy
    }

    return {
      'driveFileId': uploadedFile.id ?? '',
      'driveFileUrl': uploadedFile.webViewLink ?? 'https://drive.google.com/file/d/${uploadedFile.id}/view',
      'fileName': fileName,
    };
  }
}
